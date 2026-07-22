import { expect, test } from '@playwright/test';

test.describe('Inventory Full Workflow', () => {
  let createdItemId = null;
  let createdDesignId = null;

  const itemName = `E2E-Test-Garment-${Date.now()}`;
  const initialStock = 7;
  const price = 125.50;
  const stockDelta = 5;
  const expectedFinalStock = initialStock + stockDelta;

  test('complete inventory lifecycle: add, search, filter, adjust stock, verify persistence, gallery', async ({ page, request }) => {
    // ══════════════════════════════════════════════════════════
    // STEP 1: Load the SPA first (to have a page context for fetch)
    // ══════════════════════════════════════════════════════════
    await page.goto('/');
    await expect(page.getByTestId('system-name')).toHaveText('PrintSync', { timeout: 20000 });
    console.log('DEBUG: SPA loaded successfully');

    // ══════════════════════════════════════════════════════════
    // STEP 2: Create item using browser fetch (goes through Vite proxy)
    // ══════════════════════════════════════════════════════════
    const apiResult = await page.evaluate(async (item) => {
      try {
        const res = await fetch('/inventory/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        const body = await res.json();
        return { status: res.status, body: body, ok: res.ok };
      } catch (err) {
        return { status: 0, body: { error: err.message, stack: err.stack }, ok: false };
      }
    }, { name: itemName, stock: initialStock, price: price, category: 'Manual Entry' });
    console.log('DEBUG create via browser fetch:', JSON.stringify(apiResult));

    expect(apiResult.ok).toBeTruthy();
    expect(apiResult.status).toBe(201);
    createdItemId = apiResult.body.item.id;

    // ══════════════════════════════════════════════════════════
    // STEP 3: Wait for loading to finish, then find item
    // ══════════════════════════════════════════════════════════
    await expect(page.getByText('Loading inventory…')).toBeHidden({ timeout: 20000 });

    // Search for the item
    const searchInput = page.getByPlaceholder(/search items by name/i);
    await searchInput.fill(itemName);

    // Wait for filter debounce
    await page.waitForTimeout(500);

    // Verify item row appears in the table
    const itemRow = page.getByRole('row').filter({ hasText: itemName });
    await expect(itemRow).toBeVisible({ timeout: 10000 });
    await expect(itemRow).toContainText(`${initialStock} units`);
    await expect(itemRow).toContainText(`₱${price.toFixed(2)}`);

    // Item count in header should be > 0
    await expect(page.getByTestId('item-count')).not.toHaveText('0');

    // ══════════════════════════════════════════════════════════
    // STEP 4: Search behavior
    // ══════════════════════════════════════════════════════════
    await expect(itemRow).toBeVisible();

    // Search for non-existent name → item should be hidden
    await searchInput.fill('NONEXISTENT-ZYX-12345');
    await page.waitForTimeout(300);
    await expect(itemRow).toBeHidden();

    // Clear search → item should reappear
    await searchInput.fill('');
    await page.waitForTimeout(300);
    await expect(itemRow).toBeVisible();

    // ══════════════════════════════════════════════════════════
    // STEP 5: Filter by category
    // ══════════════════════════════════════════════════════════
    // Item created with category "Manual Entry"
    // Click "Garment" → item should be hidden
    await page.getByRole('button', { name: 'Garment' }).click();
    await page.waitForTimeout(300);
    await expect(itemRow).toBeHidden();

    // Click "All" → item should reappear
    await page.getByRole('button', { name: 'All' }).click();
    await page.waitForTimeout(300);
    await expect(itemRow).toBeVisible();

    // ══════════════════════════════════════════════════════════
    // STEP 6: Adjust stock via UI
    // ══════════════════════════════════════════════════════════
    await searchInput.fill(itemName);
    await page.waitForTimeout(300);

    const stockInput = itemRow.getByLabel(`Stock adjustment for ${itemName}`);
    await stockInput.fill(String(stockDelta));

    const updateResponsePromise = page.waitForResponse((response) =>
      response.url().includes(`/inventory/items/${createdItemId}/stock`) &&
      response.request().method() === 'PATCH'
    );
    await itemRow.getByRole('button', { name: 'Update Stock' }).click();
    const updateResponse = await updateResponsePromise;
    expect(updateResponse.status()).toBe(200);

    // Verify updated stock in the UI
    await expect(itemRow).toContainText(`${expectedFinalStock} units`);

    // ══════════════════════════════════════════════════════════
    // STEP 7: Verify persistence after page reload
    // ══════════════════════════════════════════════════════════
    await page.reload();
    await expect(page.getByText('Loading inventory…')).toBeHidden({ timeout: 20000 });

    // Search for the item and verify stock persisted
    await page.getByPlaceholder(/search items by name/i).fill(itemName);
    await page.waitForTimeout(500);
    const reloadedRow = page.getByRole('row').filter({ hasText: itemName });
    await expect(reloadedRow).toContainText(`${expectedFinalStock} units`);

    // ══════════════════════════════════════════════════════════
    // STEP 8: Design Gallery interaction
    // ══════════════════════════════════════════════════════════
    const designTitle = `E2E-Design-${Date.now()}`;
    const designUrl = 'https://placehold.co/300x300/EEE/999?text=E2E+Test';

    // Create a design via browser fetch
    const designResult = await page.evaluate(async (design) => {
      try {
        const res = await fetch('/inventory/designs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(design),
        });
        const body = await res.json();
        return { status: res.status, body, ok: res.ok };
      } catch (err) {
        return { status: 0, body: { error: err.message }, ok: false };
      }
    }, { title: designTitle, url: designUrl, product_id: createdItemId, uploaded_by: 'e2e-test-user' });
    console.log('DEBUG design create:', JSON.stringify(designResult));

    expect(designResult.ok).toBeTruthy();
    createdDesignId = designResult.body.design.id;

    // Reload to pick up the new design from DB
    await page.reload();
    await expect(page.getByText('Loading inventory…')).toBeHidden({ timeout: 20000 });

    // Verify gallery section is present
    const designSection = page.locator('#design-repository');
    await expect(designSection).toBeVisible();

    // Verify the new design thumbnail is rendered
    const designThumbnail = designSection.getByAltText(designTitle);
    await expect(designThumbnail).toBeVisible({ timeout: 10000 });
    await expect(designThumbnail).toHaveAttribute('src', designUrl);

    // ══════════════════════════════════════════════════════════
    // STEP 9: Open and close Image Modal
    // ══════════════════════════════════════════════════════════
    await designThumbnail.click();

    const modal = page.getByTestId('image-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(`Full Resolution Preview: ${designTitle}`);

    const modalImage = modal.getByRole('img');
    await expect(modalImage).toBeVisible();
    await expect(modalImage).toHaveAttribute('src', designUrl);

    // Close the modal
    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(modal).toBeHidden();

    // ══════════════════════════════════════════════════════════
    // STEP 10: Combined search + category filter interaction
    // ══════════════════════════════════════════════════════════
    await page.getByPlaceholder(/search items by name/i).fill(itemName);
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Garment' }).click();
    await page.waitForTimeout(300);
    const combinedRow = page.getByRole('row').filter({ hasText: itemName });
    await expect(combinedRow).toBeHidden();

    // Switch to "All" → item should reappear
    await page.getByRole('button', { name: 'All' }).click();
    await page.waitForTimeout(300);
    await expect(combinedRow).toBeVisible();
  });

  // ══════════════════════════════════════════════════════════
  // CLEANUP
  // ══════════════════════════════════════════════════════════
  test.afterEach(async ({ page }) => {
    // Use browser fetch for cleanup too
    await page.evaluate(async (ids) => {
      if (ids.designId) {
        await fetch(`/inventory/designs/${ids.designId}`, { method: 'DELETE' });
      }
      if (ids.itemId) {
        await fetch(`/inventory/items/${ids.itemId}`, { method: 'DELETE' });
      }
    }, { designId: createdDesignId, itemId: createdItemId });
    console.log('DEBUG cleanup done for item', createdItemId);
  });
});

