import { expect, test } from '@playwright/test';

test.describe('POS Full Workflow', () => {
  let createdItemId = null;
  let createdOrderId = null;

  const itemName = `E2E-POS-Product-${Date.now()}`;
  const initialStock = 15;
  const price = 350.00;
  const purchaseQuantity = 2;

  test('complete POS lifecycle: browse, search, add to cart, adjust, checkout, receipt, verify transaction history', async ({ page }) => {
    // ══════════════════════════════════════════════════════════
    // STEP 1: Load SPA
    // ══════════════════════════════════════════════════════════
    await page.goto('/');
    await expect(page.getByTestId('system-name')).toHaveText('PrintSync', { timeout: 20000 });
    console.log('DEBUG: SPA loaded successfully');

    // ══════════════════════════════════════════════════════════
    // STEP 2: Create a test product via browser fetch (goes through Vite proxy)
    // ══════════════════════════════════════════════════════════
    const createResult = await page.evaluate(async (item) => {
      try {
        const res = await fetch('/inventory/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        const body = await res.json();
        return { status: res.status, body, ok: res.ok };
      } catch (err) {
        return { status: 0, body: { error: err.message }, ok: false };
      }
    }, { name: itemName, stock: initialStock, price, category: 'Garment' });
    console.log('DEBUG create product:', JSON.stringify(createResult));

    expect(createResult.ok).toBeTruthy();
    expect(createResult.status).toBe(201);
    createdItemId = createResult.body.item.id;

    // ══════════════════════════════════════════════════════════
    // STEP 3: Navigate to POS page
    // ══════════════════════════════════════════════════════════
    await page.getByTestId('nav-label-pos').click();
    await expect(page).toHaveURL('/pos');

    // Wait for loading to finish
    await expect(page.getByText('Loading POS…')).toBeHidden({ timeout: 20000 });
    console.log('DEBUG: POS page loaded');

    // ══════════════════════════════════════════════════════════
    // STEP 4: Search for the created item
    // ══════════════════════════════════════════════════════════
    const searchInput = page.getByPlaceholder(/search by name/i);
    await searchInput.fill(itemName);
    await page.waitForTimeout(300);

    // Verify item appears in the product list
    const itemRow = page.getByRole('row').filter({ hasText: itemName });
    await expect(itemRow).toBeVisible({ timeout: 10000 });
    await expect(itemRow).toContainText(String(initialStock));

    // ══════════════════════════════════════════════════════════
    // STEP 5: Search behavior — non-existent item
    // ══════════════════════════════════════════════════════════
    await searchInput.fill('NONEXISTENT-ZYX-98765');
    await page.waitForTimeout(300);
    await expect(page.getByText('No matching items found.')).toBeVisible();
    await expect(itemRow).toBeHidden();

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(300);

    // ══════════════════════════════════════════════════════════
    // STEP 6: Add item to cart
    // ══════════════════════════════════════════════════════════
    await searchInput.fill(itemName);
    await page.waitForTimeout(300);

    // Click "Add to Cart"
    await itemRow.getByRole('button', { name: 'Add to Cart' }).click();

    // Verify cart shows 1 item
    await expect(page.getByTestId('cart-count')).toHaveText('1');
    console.log('DEBUG: Item added to cart');

    // ══════════════════════════════════════════════════════════
    // STEP 7: Adjust quantity in cart
    // ══════════════════════════════════════════════════════════
    // Click "+" to increase quantity to 2
    await page.locator('#pos-cart-section button').first().click();
    await page.waitForTimeout(200);

    // Verify cart item shows quantity 2
    const cartRow = page.locator('#pos-cart-section tbody tr');
    await expect(cartRow).toContainText('2');

    // Verify subtotal and totals reflect the quantity
    // Subtotal should be price * 2 = 700
    const expectedSubtotal = price * purchaseQuantity;
    await expect(page.getByTestId('subtotal-val')).toHaveText(`₱${expectedSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    // Verify total with 12% tax
    const expectedTax = expectedSubtotal * 0.12;
    const expectedTotal = expectedSubtotal + expectedTax;
    await expect(page.getByTestId('total-val')).toHaveText(`₱${expectedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    console.log('DEBUG: Cart quantities and totals verified');

    // ══════════════════════════════════════════════════════════
    // STEP 8: Proceed to checkout via OrderSummary
    // ══════════════════════════════════════════════════════════
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();

    // Verify CheckoutModal appears
    await expect(page.getByRole('dialog', { name: 'Checkout confirmation' })).toBeVisible();
    // Note: CheckoutModal uses formatMoney = (value) => value.toLocaleString() — no forced decimals
    await expect(page.getByLabel('checkout grand total')).toHaveText(`₱${expectedSubtotal.toLocaleString()}`);

    console.log('DEBUG: Checkout modal visible');

    // ══════════════════════════════════════════════════════════
    // STEP 9: Confirm order
    // ══════════════════════════════════════════════════════════
    await page.getByRole('button', { name: 'Confirm order' }).click();

    // Wait for the receipt to appear after the API call completes
    await expect(page.getByLabel('receipt', { exact: true })).toBeVisible({ timeout: 15000 });
    console.log('DEBUG: Receipt visible after order confirmation');

    // Verify receipt shows transaction details
    const transactionIdElement = page.getByLabel('transaction id');
    await expect(transactionIdElement).toBeVisible();
    const transactionId = await transactionIdElement.textContent();
    expect(transactionId).toMatch(/^TXN-\d{8}-[A-Z0-9]{6}$/);
    createdOrderId = transactionId;
    console.log('DEBUG: Transaction ID:', transactionId);

    // Verify receipt shows the purchased item
    await expect(page.getByLabel('receipt items')).toBeVisible();
    await expect(page.getByLabel(`receipt item ${itemName}`)).toBeVisible();
    await expect(page.getByLabel(`quantity of ${itemName}`)).toHaveText(`x${purchaseQuantity}`);

    // Verify receipt grand total (Receipt uses formatMoney = (value) => value.toLocaleString() — no forced decimals)
    await expect(page.getByLabel('receipt grand total')).toHaveText(`₱${expectedSubtotal.toLocaleString()}`);

    // ══════════════════════════════════════════════════════════
    // STEP 10: Close receipt
    // ══════════════════════════════════════════════════════════
    await page.getByRole('button', { name: 'Close receipt' }).click();
    await expect(page.getByLabel('receipt', { exact: true })).toBeHidden();

    // Verify cart is cleared after receipt close
    await expect(page.getByTestId('cart-count')).toHaveText('0');
    await expect(page.getByText('Your cart is empty.')).toBeVisible();

    console.log('DEBUG: Receipt closed, cart cleared');

    // ══════════════════════════════════════════════════════════
    // STEP 11: Verify transaction history
    // ══════════════════════════════════════════════════════════
    const historySection = page.locator('#pos-transaction-history');
    await expect(historySection).toBeVisible();

    // The newly created transaction should be visible (most recent)
    const transactionRow = historySection.getByRole('row').filter({ hasText: transactionId });
    await expect(transactionRow).toBeVisible({ timeout: 10000 });
    // Backend stores total_amount as subtotal; TransactionHistory formatCurrency uses minimumFractionDigits: 2
    await expect(transactionRow).toContainText(`₱${expectedSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    await expect(transactionRow).toContainText(String(purchaseQuantity));

    console.log('DEBUG: Transaction history verified');

    // ══════════════════════════════════════════════════════════
    // STEP 12: Verify stock was deducted by reloading inventory page
    // ══════════════════════════════════════════════════════════
    await page.getByTestId('nav-label-inventory').click();
    await expect(page).toHaveURL('/inventory');
    await expect(page.getByText('Loading inventory…')).toBeHidden({ timeout: 20000 });

    // Search for the item
    await page.getByPlaceholder(/search items by name/i).fill(itemName);
    await page.waitForTimeout(500);

    const inventoryRow = page.getByRole('row').filter({ hasText: itemName });
    const expectedFinalStock = initialStock - purchaseQuantity;
    await expect(inventoryRow).toContainText(`${expectedFinalStock} units`);

    console.log('DEBUG: Stock verified after deduction');
  });

  // ══════════════════════════════════════════════════════════
  // CLEANUP
  // ══════════════════════════════════════════════════════════
  test.afterEach(async ({ page }) => {
    await page.evaluate(async (ids) => {
      // Delete the order if created
      // Note: orders table may have constraints; we delete order items first via cascade
      // Since we don't have a DELETE endpoint for orders, we skip order cleanup.
      // The test product cleanup will remove the cascade.

      // Delete the test product
      if (ids.itemId) {
        await fetch(`/inventory/items/${ids.itemId}`, { method: 'DELETE' });
      }
    }, { itemId: createdItemId, orderId: createdOrderId });
    console.log('DEBUG cleanup done for item', createdItemId);
  });
});

