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
    // ──────────────────────────────────────────────────────────
    // STEP 1: Load page and verify empty states
    // ──────────────────────────────────────────────────────────
    await page.goto('/inventory');
    await expect(page.getByText('Loading inventory…')).toBeHidden();

    // Verify empty table state
    await expect(
      page.getByText('Inventory is currently empty (Initialized State).')
    ).toBeVisible();

    // Verify empty design gallery state
    await expect(
      page.getByText('No designs found in repository.')
    ).toBeVisible();

    // Verify header shows 0 items
    await expect(page.getByTestId('item-count')).toHaveTextContent('0');

    // ──────────────────────────────────────────────────────────
    // STEP 2: Add a new inventory item (Garment category)
    // ──────────────────────────────────────────────────────────
    await page.getByLabel('Item Name:').fill(itemName);
    await page.getByLabel('Initial Stock:').fill(String(initialStock));
    await page.getByLabel(/Unit Price/).fill(String(price));

    const createResponsePromise = page.waitForResponse((response) =>
      response.url().endsWith('/inventory/items') &&
      response.request().method() === 'POST'
    );
    await page.getByRole('button', { name: 'Add to Inventory' }).click();
    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);

    const createdItem = (await createResponse.json()).item;
    createdItemId = createdItem.id;

    // Verify item appears in table
    const itemRow = page.getByRole('row').filter({ hasText: itemName });
    await expect(itemRow).toBeVisible();
    await expect(itemRow).toContainText(`${initialStock} units`);
    await expect(itemRow).toContainText(`₱${price.toFixed(2)}`);

    // Header count should now be 1
    await expect(page.getByTestId('item-count')).toHaveTextContent('1');

    // ──────────────────────────────────────────────────────────
    // STEP 3: Search for the item by name
    // ──────────────────────────────────────────────────────────
    const searchInput = page.getByPlaceholder(/search items by name/i);
    await searchInput.fill(itemName);
    // The row should remain visible
    await expect(itemRow).toBeVisible();

    // Search for non-existent name and verify row disappears
    await searchInput.fill('NONEXISTENT-ZYX');
    await expect(itemRow).toBeHidden();

    // Clear search and verify row reappears
    await searchInput.fill('');
    await expect(itemRow).toBeVisible();

    // ──────────────────────────────────────────────────────────
    // STEP 4: Filter by category
    // ──────────────────────────────────────────────────────────
    // The item was created with category "Manual Entry" by default from ItemForm
    // Click "Garment" filter button → the "Manual Entry" item should be hidden
    await page.getByRole('button', { name: 'Garment' }).click();
    await expect(itemRow).toBeHidden();

    // Click "All" filter button → item should reappear
    await page.getByRole('button', { name: 'All' }).click();
    await expect(itemRow).toBeVisible();

    // ──────────────────────────────────────────────────────────
    // STEP 5: Adjust stock
    // ──────────────────────────────────────────────────────────
    // Re-focus search to ensure the row is visible
    await searchInput.fill(itemName);

    const stockInput = itemRow.getByLabel(`Stock adjustment for ${itemName}`);
    await stockInput.fill(String(stockDelta));

    const updateResponsePromise = page.waitForResponse((response) =>
      response.url().includes(`/inventory/items/${createdItemId}/stock`) &&
      response.request().method() === 'PATCH'
    );
    await itemRow.getByRole('button', { name: 'Update Stock' }).click();
    const updateResponse = await updateResponsePromise;
    expect(updateResponse.status()).toBe(200);

    // Verify the stock count updated in the UI
    await expect(itemRow).toContainText(`${expectedFinalStock} units`);

    // ──────────────────────────────────────────────────────────
    // STEP 6: Verify persistence after page reload
    // ──────────────────────────────────────────────────────────
    await page.reload();
    await expect(page.getByText('Loading inventory…')).toBeHidden();

    // Search for the item again
    await page.getByPlaceholder(/search items by name/i).fill(itemName);
    const reloadedRow = page.getByRole('row').filter({ hasText: itemName });
    await expect(reloadedRow).toContainText(`${expectedFinalStock} units`);

    // ──────────────────────────────────────────────────────────
    // STEP 7: Design Gallery - create a design via API and verify UI
    // ──────────────────────────────────────────────────────────
    const designTitle = `E2E-Design-${Date.now()}`;
    const designUrl = 'https://placehold.co/300x300/EEE/999?text=E2E+Test';

    const designCreateResponse = await request.post('/inventory/designs', {
      data: {
        title: designTitle,
        url: designUrl,
        product_id: createdItemId,
        uploaded_by: 'e2e-test-user',
      },
    });
    expect(designCreateResponse.ok()).toBeTruthy();
    const createdDesign = (await designCreateResponse.json()).design;
    createdDesignId = createdDesign.id;

    // Reload page to pick up the new design
    await page.reload();
    await expect(page.getByText('Loading inventory…')).toBeHidden();

    // Verify the design thumbnail is visible in the gallery
    const designSection = page.locator('#design-repository');
    await expect(designSection).toBeVisible();

    const designThumbnail = designSection.getByAltText(designTitle);
    await expect(designThumbnail).toBeVisible();
    await expect(designThumbnail).toHaveAttribute('src', designUrl);

    // ──────────────────────────────────────────────────────────
    // STEP 8: Open and close Image Modal
    // ──────────────────────────────────────────────────────────
    // Click the thumbnail to open the modal
    await designThumbnail.click();

    // Verify modal is visible with full resolution preview
    const modal = page.getByTestId('image-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(`Full Resolution Preview: ${designTitle}`);

    const modalImage = modal.getByRole('img');
    await expect(modalImage).toBeVisible();
    await expect(modalImage).toHaveAttribute('src', designUrl);

    // Close the modal
    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(modal).toBeHidden();

    // ──────────────────────────────────────────────────────────
    // STEP 9: Combined search + category filter interaction
    // ──────────────────────────────────────────────────────────
    // Search for item and apply Garment filter at the same time
    await page.getByPlaceholder(/search items by name/i).fill(itemName);
    await page.getByRole('button', { name: 'Garment' }).click();
    // Item has category "Manual Entry" so it should be hidden
    const combinedRow = page.getByRole('row').filter({ hasText: itemName });
    await expect(combinedRow).toBeHidden();

    // Switch back to "All" and verify item is visible
    await page.getByRole('button', { name: 'All' }).click();
    await expect(combinedRow).toBeVisible();
  });

  // ──────────────────────────────────────────────────────────
  // CLEANUP: Remove created item and design
  // ──────────────────────────────────────────────────────────
  test.afterEach(async ({ request }) => {
    if (createdDesignId) {
      const delDesignResponse = await request.delete(`/inventory/designs/${createdDesignId}`);
      expect(delDesignResponse.ok()).toBeTruthy();
    }
    if (createdItemId) {
      const delItemResponse = await request.delete(`/inventory/items/${createdItemId}`);
      expect(delItemResponse.ok()).toBeTruthy();
    }
  });
});

