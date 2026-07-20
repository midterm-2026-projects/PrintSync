import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { pool } from '../../db/pool.js';
import { ProductModel } from '../../models/ProductModel.js';
import { analyticsModel } from '../../models/analyticsModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env explicitly (cwd-independent)
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

function randId(prefix) {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

describe('analyticsModel integration (DB-backed queries)', () => {
  const canRun = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;

  if (!canRun) {
    it.skip('skipped: missing DB credentials');
    return;
  }

  let productId;
  let orderIdA;
  let orderIdB;

  beforeAll(async () => {
    // Ensure product exists for FK constraints on order_items (optional but safe)
    productId = Math.floor(1_000_000 + Math.random() * 10_000_000);
    await ProductModel.createItem({
      id: productId,
      name: `itest-prod-${randId('p')}`,
      stock: 100,
    });

    // Create two orders: one “today-ish” and one in the past within the 30d window.
    // We update created_at manually so we can assert trend/KPI deterministically.
    orderIdA = `TXN-${randId('A')}`;
    orderIdB = `TXN-${randId('B')}`;

    // Insert orders
    await pool.query(
      `
      INSERT INTO public.orders (order_id, total_amount, created_at)
      VALUES ($1, $2, NOW() - INTERVAL '1 day'),
             ($3, $4, NOW() - INTERVAL '2 days')
      `,
      [orderIdA, 100, orderIdB, 250]
    );

    // Insert order_items (required by order_items FKs)
    const productName = `itest-prod-${randId('p')}`;

    await pool.query(
      `
      INSERT INTO public.order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
      VALUES
        ($1, $2, $3, 1, 100, 100),
        ($4, $2, $3, 1, 250, 250)
      `,
      [orderIdA, productId, productName, orderIdB]
    );

    // Keep products.name consistent with order_items.product_name for clarity.
    await ProductModel.updateStock(productId, 100);
  });

  afterAll(async () => {
    // best-effort cleanup
    try {
      await pool.query('DELETE FROM public.order_items WHERE order_id = $1', [orderIdA]);
    } catch {}

    try {
      await pool.query('DELETE FROM public.order_items WHERE order_id = $1', [orderIdB]);
    } catch {}

    try {
      await pool.query('DELETE FROM public.orders WHERE order_id = $1', [orderIdA]);
    } catch {}

    try {
      await pool.query('DELETE FROM public.orders WHERE order_id = $1', [orderIdB]);
    } catch {}

    try {
      await pool.query('DELETE FROM public.products WHERE id = $1', [productId]);
    } catch {}
  });

  it('queryKpiByPeriod should return totalRevenue and totalOrders', async () => {
    const kpi = await analyticsModel.queryKpiByPeriod('30d');

    expect(kpi).toHaveProperty('totalRevenue');
    expect(kpi).toHaveProperty('totalOrders');

    // totalRevenue should include our two inserted orders (250 + 100)
    // DB may have existing rows; so assert at least it is >= our sum.
    expect(Number(kpi.totalRevenue)).toBeGreaterThanOrEqual(350);
    expect(Number(kpi.totalOrders)).toBeGreaterThanOrEqual(2);
  });

  it('querySalesTrendByPeriod should return daily aggregated points', async () => {
    const trend = await analyticsModel.querySalesTrendByPeriod('7d');

    expect(trend).toHaveProperty('data');
    expect(Array.isArray(trend.data)).toBe(true);

    // Ensure at least one data point exists
    expect(trend.data.length).toBeGreaterThan(0);

    // At minimum, verify that the day containing orderIdA or orderIdB contributes.
    // We can't force exact trend ordering counts without full control of created_at,
    // but we can assert amounts exist as part of aggregated set.
    const amounts = trend.data.map((d) => d.amount);
    expect(amounts.some((a) => a === 100 || a === 250)).toBe(true);
  });

  it('queryTransactionsByPeriod should return transactions with id/amount/createdAt', async () => {
    const out = await analyticsModel.queryTransactionsByPeriod('30d');

    expect(out).toHaveProperty('transactions');
    expect(Array.isArray(out.transactions)).toBe(true);

    const ids = out.transactions.map((t) => t.id);
    expect(ids).toContain(orderIdA);
    expect(ids).toContain(orderIdB);

    const a = out.transactions.find((t) => t.id === orderIdA);
    expect(a).toHaveProperty('amount');
    expect(a.amount).toBeGreaterThanOrEqual(100);
    expect(a).toHaveProperty('createdAt');
  });
});
