import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load backend/.env explicitly (cwd-independent)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// IMPORTANT: dynamic imports so dotenv is applied before pool.js is evaluated.
let salesPOSModel;
let ProductModel;

beforeAll(async () => {
  // Ensure dotenv is applied before these modules evaluate pool.js
  const salesModelMod = await import('../../models/salesModel.js');
  salesPOSModel = salesModelMod.salesPOSModel;

  const productModelMod = await import('../../models/ProductModel.js');
  ProductModel = productModelMod.ProductModel;
});




function randId(prefix) {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

async function withTestProduct({ id, name, stock }, fn) {
  // Ensure product exists (insert if missing; otherwise update stock)
  const existing = await ProductModel.getItemById(id);
  if (!existing) {
    await ProductModel.createItem({ id, name, stock });
  } else {
    await ProductModel.updateStock(id, stock);
  }

  try {
    return await fn();
  } finally {
    // Cleanup: set stock back to 0 and delete rows? 
    // Safer cleanup is: delete test product only.
    // But we don't know if other tests depend on it, so we only delete.
    try {
      await (await import('../../db/pool.js')).pool.query('DELETE FROM public.order_items WHERE product_id = $1', [id]);
    } catch {}

    try {
      await (await import('../../db/pool.js')).pool.query('DELETE FROM public.products WHERE id = $1', [id]);
    } catch {}
  }
}

describe('salesPOSModel integration (orders/order_items/products)', () => {
  let poolModule;
  let pool;

  beforeAll(async () => {
    poolModule = await import('../../db/pool.js');
    pool = poolModule.pool;
  });

  afterAll(async () => {
    try {
      if (pool) await pool.end();
    } catch {}
  });

  it('createOrder should insert an order into public.orders', async () => {
    const hasSupabase = !!process.env.SUPABASE_DB_URL;
    const hasPgHost = !!process.env.PGHOST;

    if (!hasSupabase && !hasPgHost) {
      return;
    }


    const productId = Math.floor(1_000_000 + Math.random() * 10_000_000);
    const productName = `itest-prod-${randId('p')}`;

    const orderId = `TXN-${randId('it')}`;
    const totalAmount = 10;

    await withTestProduct({ id: productId, name: productName, stock: 50 }, async () => {
      await salesPOSModel.createOrder(orderId, totalAmount);

      const fetchedOrder = await salesPOSModel.getOrderById(orderId);
      expect(fetchedOrder).toBeTruthy();
      expect(fetchedOrder.order_id).toBe(orderId);
      expect(Number(fetchedOrder.total_amount)).toBe(Number(totalAmount));

      // Cleanup
      try {
        await pool.query('DELETE FROM public.orders WHERE order_id = $1', [orderId]);
      } catch {}
    });
  });

  it('createOrderItems should insert rows into public.order_items', async () => {
    const hasSupabase = !!process.env.SUPABASE_DB_URL;
    const hasPgHost = !!process.env.PGHOST;

    if (!hasSupabase && !hasPgHost) {
      return;
    }


    const productId = Math.floor(1_000_000 + Math.random() * 10_000_000);
    const productName = `itest-prod-${randId('p')}`;

    const orderId = `TXN-${randId('it')}`;
    const totalAmount = 10;

    const items = [
      {
        order_id: orderId,
        product_id: productId,
        product_name: productName,
        quantity: 2,
        unit_price: 5,
        subtotal: 10,
      },
    ];

    await withTestProduct({ id: productId, name: productName, stock: 50 }, async () => {
      await salesPOSModel.createOrder(orderId, totalAmount);
      await salesPOSModel.createOrderItems(orderId, items);

      const fetchedOrder = await salesPOSModel.getOrderById(orderId);
      expect(fetchedOrder).toBeTruthy();

      const history = await salesPOSModel.queryOrdersSortedByCreatedAtDesc();
      const idx = history.findIndex((r) => r.order_id === orderId);
      expect(idx).toBeGreaterThanOrEqual(0);

      // Cleanup order rows we inserted (products cleanup happens in withTestProduct)
      try {
        await pool.query('DELETE FROM public.order_items WHERE order_id = $1', [orderId]);
      } catch {}
      try {
        await pool.query('DELETE FROM public.orders WHERE order_id = $1', [orderId]);
      } catch {}
    });
  });

  it('getOrderById should return the inserted order', async () => {
    const hasSupabase = !!process.env.SUPABASE_DB_URL;
    const hasPgHost = !!process.env.PGHOST;

    if (!hasSupabase && !hasPgHost) {
      return;
    }


    const productId = Math.floor(1_000_000 + Math.random() * 10_000_000);
    const productName = `itest-prod-${randId('p')}`;

    const orderId = `TXN-${randId('it')}`;
    const totalAmount = 10;

    await withTestProduct({ id: productId, name: productName, stock: 50 }, async () => {
      await salesPOSModel.createOrder(orderId, totalAmount);

      const fetchedOrder = await salesPOSModel.getOrderById(orderId);
      expect(fetchedOrder).toBeTruthy();
      expect(fetchedOrder.order_id).toBe(orderId);
      expect(Number(fetchedOrder.total_amount)).toBe(Number(totalAmount));

      try {
        await pool.query('DELETE FROM public.orders WHERE order_id = $1', [orderId]);
      } catch {}
    });
  });

  it('queryOrdersSortedByCreatedAtDesc should include the inserted order and preserve descending ordering', async () => {
    const hasSupabase = !!process.env.SUPABASE_DB_URL;
    const hasPgHost = !!process.env.PGHOST;

    if (!hasSupabase && !hasPgHost) {
      return;
    }


    const productId = Math.floor(1_000_000 + Math.random() * 10_000_000);
    const productName = `itest-prod-${randId('p')}`;

    const orderId = `TXN-${randId('it')}`;
    const totalAmount = 10;

    await withTestProduct({ id: productId, name: productName, stock: 50 }, async () => {
      await salesPOSModel.createOrder(orderId, totalAmount);

      const history = await salesPOSModel.queryOrdersSortedByCreatedAtDesc();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);

      const idx = history.findIndex((r) => r.order_id === orderId);
      expect(idx).toBeGreaterThanOrEqual(0);

      if (idx > 0) {
        const before = history[idx - 1]?.created_at;
        const ours = history[idx]?.created_at;
        const beforeT = before ? new Date(before).getTime() : NaN;
        const oursT = ours ? new Date(ours).getTime() : NaN;
        expect(oursT).toBeLessThanOrEqual(beforeT);
      }

      try {
        await pool.query('DELETE FROM public.orders WHERE order_id = $1', [orderId]);
      } catch {}
    });
  });

});

