import { expect, test } from '@playwright/test';

test.describe('Analytics Full Workflow', () => {
  let createdItemId = null;
  let createdOrderId = null;

  const itemName = `E2E-Analytics-Product-${Date.now()}`;
  const initialStock = 20;
  const price = 250.00;
  const purchaseQuantity = 3;

  test('complete analytics lifecycle: seed data, navigate to analytics, verify KPI, chart, transactions, period selector, AI insights', async ({ page }) => {
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
    // STEP 3: Create POS orders to seed analytics data
    // ══════════════════════════════════════════════════════════
    // Create 2 orders for the test product
    for (let i = 0; i < 2; i++) {
      const orderResult = await page.evaluate(async (orderData) => {
        try {
          const res = await fetch('/pos/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
          });
          const body = await res.json();
          return { status: res.status, body, ok: res.ok };
        } catch (err) {
          return { status: 0, body: { error: err.message }, ok: false };
        }
      }, {
        items: [
          { product_id: createdItemId, quantity: purchaseQuantity },
        ],
      });
      console.log(`DEBUG create order ${i + 1}:`, JSON.stringify(orderResult));
      expect(orderResult.ok).toBeTruthy();
      if (i === 0) {
        createdOrderId = orderResult.body.order?.orderId || null;
      }
    }

    // ══════════════════════════════════════════════════════════
    // STEP 4: Navigate to Analytics page
    // ══════════════════════════════════════════════════════════
    await page.getByTestId('nav-label-analytics').click();
    await expect(page).toHaveURL('/analytics');
    console.log('DEBUG: Analytics page loaded');

    // ══════════════════════════════════════════════════════════
    // STEP 5: Verify Analytics Header
    // ══════════════════════════════════════════════════════════
    await expect(page.getByText('AI-Assisted Business Analytics')).toBeVisible({ timeout: 10000 });

    // ══════════════════════════════════════════════════════════
    // STEP 6: Verify Forecast Period Selector
    // ══════════════════════════════════════════════════════════
    const periodSelector = page.getByLabel('Forecasting Period');
    await expect(periodSelector).toBeVisible();
    await expect(periodSelector).toHaveValue('30d');

    // ══════════════════════════════════════════════════════════
    // STEP 7: Verify KPI Display loads from backend
    // ══════════════════════════════════════════════════════════
    // Wait for the KPI data to load from the backend
    const revenueTotal = page.getByTestId('revenue-total');
    await expect(revenueTotal).toBeVisible({ timeout: 15000 });
    // Revenue should be > 0 since we created orders
    const revenueText = await revenueTotal.textContent();
    expect(revenueText).toMatch(/₱[0-9,]+\.\d{2}/);
    const revenueValue = parseFloat(revenueText.replace(/[₱,]/g, ''));
    expect(revenueValue).toBeGreaterThan(0);
    console.log(`DEBUG: Revenue displayed: ${revenueText}`);

    // Verify Total Orders Processed is displayed
    await expect(page.getByText(/Total Orders Processed/i)).toBeVisible();

    // ══════════════════════════════════════════════════════════
    // STEP 8: Verify Sales Trend Chart
    // ══════════════════════════════════════════════════════════
    const salesChart = page.getByTestId('sales-line-chart');
    await expect(salesChart).toBeVisible({ timeout: 10000 });

    // Verify the chart has data points (red dots)
    const chartDots = page.getByTestId('chart-dot');
    const dotCount = await chartDots.count();
    expect(dotCount).toBeGreaterThanOrEqual(1);
    console.log(`DEBUG: Chart has ${dotCount} data points`);

    // Verify the polyline connecting the points
    await expect(page.getByTestId('chart-polyline')).toBeVisible();

    // ══════════════════════════════════════════════════════════
    // STEP 9: Verify Transaction History
    // ══════════════════════════════════════════════════════════
    await expect(page.getByText('Raw Transaction Log')).toBeVisible({ timeout: 10000 });
    // Transaction history table should show transactions
    const txnRows = page.locator('#transaction-history tbody tr');
    await expect(txnRows.first()).toBeVisible({ timeout: 10000 });
    const txnCount = await txnRows.count();
    expect(txnCount).toBeGreaterThanOrEqual(1);
    console.log(`DEBUG: Transaction history has ${txnCount} rows`);

    // ══════════════════════════════════════════════════════════
    // STEP 10: Verify Predicted Demand Table
    // ══════════════════════════════════════════════════════════
    await expect(page.getByText('Predicted Demand')).toBeVisible();
    await expect(page.getByText('Cotton T-Shirt')).toBeVisible();
    await expect(page.getByText('Polo Shirt')).toBeVisible();
    await expect(page.getByText('Hoodie')).toBeVisible();

    // Default 30d period: Medium confidence for all categories
    const mediumLabels = page.getByText('Medium', { exact: true });
    const mediumCount = await mediumLabels.count();
    expect(mediumCount).toBeGreaterThanOrEqual(3);
    console.log('DEBUG: PredictedDemandTable shows Medium confidence');

    // ══════════════════════════════════════════════════════════
    // STEP 11: Test Period Selector — switch to 7d
    // ══════════════════════════════════════════════════════════
    await periodSelector.selectOption('7d');

    // Wait for data refresh from API
    await page.waitForTimeout(1000);

    // PredictedDemandTable should update to 7d values:
    // 7d multiplier = 0.6: Cotton 60*0.6=36, Polo 45*0.6=27, Hoodie 30*0.6=18
    await expect(page.getByText('36')).toBeVisible();
    await expect(page.getByText('27')).toBeVisible();
    await expect(page.getByText('18')).toBeVisible();

    // Confidence should be "High" for 7d
    const highLabels = page.getByText('High', { exact: true });
    const highCount = await highLabels.count();
    expect(highCount).toBeGreaterThanOrEqual(3);
    console.log('DEBUG: Period changed to 7d, High confidence shown');

    // ══════════════════════════════════════════════════════════
    // STEP 12: Switch to 90d period
    // ══════════════════════════════════════════════════════════
    await periodSelector.selectOption('90d');
    await page.waitForTimeout(1000);

    // PredictedDemandTable should update:
    // 90d multiplier = 1.7: Cotton 60*1.7=102, Polo 45*1.7=77, Hoodie 30*1.7=51
    await expect(page.getByText('102')).toBeVisible();
    await expect(page.getByText('77')).toBeVisible();
    await expect(page.getByText('51')).toBeVisible();

    // Confidence should be "Low" for 90d
    const lowLabels = page.getByText('Low', { exact: true });
    const lowCount = await lowLabels.count();
    expect(lowCount).toBeGreaterThanOrEqual(3);
    console.log('DEBUG: Period changed to 90d, Low confidence shown');

    // ══════════════════════════════════════════════════════════
    // STEP 13: Switch back to 30d period
    // ══════════════════════════════════════════════════════════
    await periodSelector.selectOption('30d');
    await page.waitForTimeout(1000);

    // Revert to Medium confidence
    await expect(page.getByText('60')).toBeVisible();
    const mediumLabelsAgain = page.getByText('Medium', { exact: true });
    const mediumCountAgain = await mediumLabelsAgain.count();
    expect(mediumCountAgain).toBeGreaterThanOrEqual(3);
    console.log('DEBUG: Period reverted to 30d, Medium confidence restored');

    // ══════════════════════════════════════════════════════════
    // STEP 14: Test AI Insights
    // ══════════════════════════════════════════════════════════
    // Verify AI Insight section
    await expect(page.getByText('AI Business Insights')).toBeVisible();
    await expect(page.getByText(/Click analyze to generate AI suggestions/i)).toBeVisible();

    // Click "Analyze Business Trends"
    await page.getByRole('button', { name: /Analyze Business Trends/i }).click();

    // Should show loading state
    await expect(page.getByText(/Generating insights.../i)).toBeVisible({ timeout: 5000 });

    // Wait for the API response and verify insight text appears
    // The AI insights endpoint will return a result (either LLM-based or local fallback)
    await expect(page.getByTestId('insight-box')).not.toContainText(/Click analyze/i, { timeout: 15000 });

    // The insight box should have content other than the initial prompt
    const insightBox = page.getByTestId('insight-box');
    const insightText = await insightBox.textContent();
    console.log(`DEBUG: AI insight text: ${insightText}`);

    // Verify "Generating insights..." is gone
    await expect(page.getByText(/Generating insights.../i)).toBeHidden({ timeout: 5000 });

    // ══════════════════════════════════════════════════════════
    // STEP 15: Test KPI updates after period change
    // ══════════════════════════════════════════════════════════
    // KPI should still be visible and have data
    await expect(revenueTotal).toBeVisible();

    console.log('DEBUG: All analytics workflow steps completed successfully');
  });

  // ══════════════════════════════════════════════════════════
  // CLEANUP
  // ══════════════════════════════════════════════════════════
  test.afterEach(async ({ page }) => {
    // Clean up the test product (orders cascade delete via DB constraint)
    await page.evaluate(async (ids) => {
      if (ids.itemId) {
        await fetch(`/inventory/items/${ids.itemId}`, { method: 'DELETE' });
      }
    }, { itemId: createdItemId, orderId: createdOrderId });
    console.log('DEBUG cleanup done for item', createdItemId);
  });
});

