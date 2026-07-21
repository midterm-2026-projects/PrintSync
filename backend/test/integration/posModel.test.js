import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env explicitly (cwd-independent)
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Dynamic imports so dotenv is applied before pool.js is evaluated
let posModel;
let pool;

beforeAll(async () => {
  const posModelMod = await import('../../models/posModel.js');
  posModel = posModelMod.posModel;

  const poolMod = await import('../../db/pool.js');
  pool = poolMod.pool;
});

afterAll(async () => {
  try {
    if (pool) await pool.end();
  } catch {}
});

/**
 * Guards — skip tests if no DB credentials are available.
 */
function hasDb() {
  return !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
}

/**
 * Generate a unique product ID for test data.
 */
function productId() {
  return Math.floor(1_000_000 + Math.random() * 8_999_999);
}

/**
 * Generate a unique order ID for test data.
 */
function orderId() {
  const now = new Date();
  const datePart = now.toISOString().split('T')[0].replace(/-/g, '');
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${datePart}-${randomPart}`;
}

/**
 * Generate a unique prefix string for test identifiers.
 */
function randId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

/**
 * Helper: create a test product and clean it up after the callback.
 */
async function withTestProduct(productData, fn) {
  const id = productData.id || productId();
  await pool.query(
    `INSERT INTO products (id, name, stock, price, category, is_active)
     VALUES ($1, $2, $3, $4, $5, true)
     ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, stock = EXCLUDED.stock, price = EXCLUDED.price, category = EXCLUDED.category, is_active = true`,
    [id, productData.name || `test-prod-${randId('p')}`, productData.stock ?? 100, productData.price ?? 500, productData.category || 'Test']
  );

  try {
    return await fn({ id, ...productData });
  } finally {
    try {
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
    } catch {}
  }
}

/**
 * Helper: create a test order + items and clean up after the callback.
 * Returns { order, product, stockMovementsBefore }.
 */
async function withTestOrder(orderData, fn) {
  const prodId = productId();
  const prodName = orderData.productName || `test-prod-${randId('p')}`;
  const initialStock = orderData.initialStock ?? 50;

  // Create product
  await pool.query(
    `INSERT INTO products (id, name, stock, price, is_active)
     VALUES ($1, $2, $3, $4, true)`,
    [prodId, prodName, initialStock, orderData.unitPrice ?? 500]
  );

  // Get stock movements count before order
  const { rows: beforeRows } = await pool.query(
    'SELECT COUNT(*)::integer AS cnt FROM stock_movements WHERE product_id = $1',
    [prodId]
  );
  const stockMovementsBefore = beforeRows[0]?.cnt ?? 0;

  const oid = orderId();
  const items = [
    {
      product_id: prodId,
      product_name: prodName,
      quantity: orderData.quantity ?? 2,
      unit_price: orderData.unitPrice ?? 500,
      subtotal: (orderData.quantity ?? 2) * (orderData.unitPrice ?? 500),
    },
  ];
  const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

  try {
    const order = await posModel.createOrder(oid, totalAmount, items);
    return await fn({ order, productId: prodId, stockMovementsBefore, oid });
  } finally {
    try {
      await pool.query('DELETE FROM order_items WHERE order_id = $1', [oid]);
    } catch {}
    try {
      await pool.query('DELETE FROM orders WHERE order_id = $1', [oid]);
    } catch {}
    try {
      await pool.query('DELETE FROM stock_movements WHERE product_id = $1', [prodId]);
    } catch {}
    try {
      await pool.query('DELETE FROM products WHERE id = $1', [prodId]);
    } catch {}
  }
}

// ============================================================
// POS Model — getAllProducts
// ============================================================
describe('posModel - getAllProducts', () => {
  it('should retrieve all active products from database', async () => {
    if (!hasDb()) return;

    await withTestProduct({ name: 'Product A', stock: 50, price: 300 }, async (created) => {
      const items = await posModel.getAllProducts({ limit: 1000, offset: 0 });

      expect(Array.isArray(items)).toBe(true);
      const found = items.find((i) => i.id === created.id);
      expect(found).toBeTruthy();
      expect(found.productName).toBe('Product A');
    });
  });

  it('should respect category filter', async () => {
    if (!hasDb()) return;

    await withTestProduct({ name: 'Cat Item', category: 'Garment', stock: 50, price: 300 }, async (created) => {
      const items = await posModel.getAllProducts({ category: 'Garment', limit: 1000, offset: 0 });

      const found = items.find((i) => i.id === created.id);
      expect(found).toBeTruthy();
      expect(found.category).toBe('Garment');
    });
  });

  it('should respect limit and offset pagination', async () => {
    if (!hasDb()) return;

    const items = await posModel.getAllProducts({ limit: 3, offset: 0 });
    expect(items.length).toBeLessThanOrEqual(3);
  });

  it('should return empty array if no items match filters', async () => {
    if (!hasDb()) return;

    const items = await posModel.getAllProducts({ category: 'NonExistentCategoryXYZ', limit: 1000, offset: 0 });
    expect(items).toEqual([]);
  });

  it('should not return inactive products', async () => {
    if (!hasDb()) return;

    const id = productId();
    await pool.query(
      `INSERT INTO products (id, name, stock, price, is_active)
       VALUES ($1, $2, $3, $4, false)`,
      [id, 'Inactive Product', 50, 300]
    );

    try {
      const items = await posModel.getAllProducts({ limit: 1000, offset: 0 });
      const found = items.find((i) => i.id === id);
      expect(found).toBeUndefined();
    } finally {
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
    }
  });
});

// ============================================================
// POS Model — searchProducts
// ============================================================
describe('posModel - searchProducts', () => {
  it('should search products by name (case-insensitive)', async () => {
    if (!hasDb()) return;

    await withTestProduct({ name: 'Premium Cotton Shirt', stock: 50, price: 300 }, async (created) => {
      const results = await posModel.searchProducts('cotton', { limit: 1000, offset: 0 });

      expect(Array.isArray(results)).toBe(true);
      const found = results.find((i) => i.id === created.id);
      expect(found).toBeTruthy();
    });
  });

  it('should respect category filter in search', async () => {
    if (!hasDb()) return;

    await withTestProduct({ name: 'Search Target', category: 'Material', stock: 50, price: 300 }, async (created) => {
      const results = await posModel.searchProducts('target', { category: 'Material', limit: 1000, offset: 0 });

      const found = results.find((i) => i.id === created.id);
      expect(found).toBeTruthy();
    });
  });

  it('should return empty array if no items match search', async () => {
    if (!hasDb()) return;

    const results = await posModel.searchProducts('xyznonexistent12345', { limit: 1000, offset: 0 });
    expect(results).toEqual([]);
  });

  it('should respect limit and offset pagination in search', async () => {
    if (!hasDb()) return;

    const results = await posModel.searchProducts('product', { limit: 5, offset: 0 });
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it('should not return inactive products in search results', async () => {
    if (!hasDb()) return;

    const id = productId();
    await pool.query(
      `INSERT INTO products (id, name, stock, price, is_active)
       VALUES ($1, $2, $3, $4, false)`,
      [id, 'Hidden Search Item', 50, 300]
    );

    try {
      const results = await posModel.searchProducts('hidden', { limit: 1000, offset: 0 });
      const found = results.find((i) => i.id === id);
      expect(found).toBeUndefined();
    } finally {
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
    }
  });
});

// ============================================================
// POS Model — getProductById
// ============================================================
describe('posModel - getProductById', () => {
  it('should retrieve product by ID from database', async () => {
    if (!hasDb()) return;

    await withTestProduct({ name: 'Specific Product', stock: 75, price: 450, category: 'Test' }, async (created) => {
      const fetched = await posModel.getProductById(created.id);

      expect(fetched).toBeTruthy();
      expect(fetched.id).toBe(created.id);
      expect(fetched.productName).toBe('Specific Product');
      expect(fetched.stock).toBe(75);
      expect(Number(fetched.price)).toBe(450);
    });
  });

  it('should return null for non-existent product', async () => {
    if (!hasDb()) return;

    const fetched = await posModel.getProductById(999999999);
    expect(fetched).toBeNull();
  });

  it('should throw error if ID is null', async () => {
    if (!hasDb()) return;

    await expect(posModel.getProductById(null)).rejects.toThrow('Product ID cannot be null');
  });

  it('should return product with productName alias', async () => {
    if (!hasDb()) return;

    await withTestProduct({ name: 'Alias Test', stock: 10, price: 100 }, async (created) => {
      const fetched = await posModel.getProductById(created.id);

      expect(fetched).toHaveProperty('productName');
      expect(fetched.productName).toBe('Alias Test');
    });
  });
});

// ============================================================
// POS Model — getAllOrders
// ============================================================
describe('posModel - getAllOrders', () => {
  it('should retrieve all orders with item count', async () => {
    if (!hasDb()) return;

    await withTestOrder({ productName: 'Order Test Item', quantity: 1, unitPrice: 500, initialStock: 50 }, async ({ oid }) => {
      const orders = await posModel.getAllOrders(1000, 0);

      expect(Array.isArray(orders)).toBe(true);
      const found = orders.find((o) => o.id === oid);
      expect(found).toBeTruthy();
      expect(found).toHaveProperty('totalAmount');
      expect(found).toHaveProperty('createdAt');
      expect(found).toHaveProperty('itemsCount');
    });
  });

  it('should include itemsCount reflecting number of order_items', async () => {
    if (!hasDb()) return;

    // Create order with 2 line items (2 different products)
    const prodId1 = productId();
    const prodId2 = productId();
    const oid = orderId();

    await pool.query(
      `INSERT INTO products (id, name, stock, price, is_active) VALUES ($1, $2, $3, $4, true)`,
      [prodId1, 'Multi Item A', 50, 100]
    );
    await pool.query(
      `INSERT INTO products (id, name, stock, price, is_active) VALUES ($1, $2, $3, $4, true)`,
      [prodId2, 'Multi Item B', 50, 200]
    );

    try {
      await posModel.createOrder(oid, 500, [
        { product_id: prodId1, product_name: 'Multi Item A', quantity: 2, unit_price: 100, subtotal: 200 },
        { product_id: prodId2, product_name: 'Multi Item B', quantity: 1, unit_price: 300, subtotal: 300 },
      ]);

      const orders = await posModel.getAllOrders(1000, 0);
      const found = orders.find((o) => o.id === oid);
      expect(found).toBeTruthy();
      expect(Number(found.itemsCount)).toBe(2);
    } finally {
      await pool.query('DELETE FROM order_items WHERE order_id = $1', [oid]);
      await pool.query('DELETE FROM orders WHERE order_id = $1', [oid]);
      await pool.query('DELETE FROM stock_movements WHERE product_id IN ($1, $2)', [prodId1, prodId2]);
      await pool.query('DELETE FROM products WHERE id IN ($1, $2)', [prodId1, prodId2]);
    }
  });

  it('should respect limit and offset pagination', async () => {
    if (!hasDb()) return;

    const orders = await posModel.getAllOrders(3, 0);
    expect(orders.length).toBeLessThanOrEqual(3);
  });
});

// ============================================================
// POS Model — getOrderById
// ============================================================
describe('posModel - getOrderById', () => {
  it('should retrieve order with items from database', async () => {
    if (!hasDb()) return;

    await withTestOrder({ productName: 'Detailed Item', quantity: 3, unitPrice: 150, initialStock: 50 }, async ({ oid }) => {
      const fetched = await posModel.getOrderById(oid);

      expect(fetched).toBeTruthy();
      expect(fetched.orderId).toBe(oid);
      expect(Number(fetched.totalAmount)).toBe(450);
      expect(fetched).toHaveProperty('createdAt');

      expect(Array.isArray(fetched.items)).toBe(true);
      expect(fetched.items.length).toBeGreaterThanOrEqual(1);

      const item = fetched.items[0];
      expect(item).toHaveProperty('productId');
      expect(item).toHaveProperty('productName');
      expect(item).toHaveProperty('quantity');
      expect(item).toHaveProperty('unitPrice');
      expect(item).toHaveProperty('subtotal');
    });
  });

  it('should return null for non-existent order', async () => {
    if (!hasDb()) return;

    const fetched = await posModel.getOrderById('TXN-NONEXISTENT-000000');
    expect(fetched).toBeNull();
  });

  it('should throw error for empty orderId', async () => {
    if (!hasDb()) return;

    await expect(posModel.getOrderById('')).rejects.toThrow('Order ID cannot be empty');
  });

  it('should throw error for null orderId', async () => {
    if (!hasDb()) return;

    await expect(posModel.getOrderById(null)).rejects.toThrow('Order ID cannot be empty');
  });
});

// ============================================================
// POS Model — createOrder (transactional)
// ============================================================
describe('posModel - createOrder (transactional)', () => {
  it('should create order with items and return order summary', async () => {
    if (!hasDb()) return;

    await withTestOrder({ productName: 'Transaction Test', quantity: 2, unitPrice: 350, initialStock: 50 }, async ({ oid }) => {
      expect(oid).toBeTruthy();
      const found = await posModel.getOrderById(oid);
      expect(found).toBeTruthy();
      expect(Number(found.totalAmount)).toBe(700);
    });
  });

  it('should deduct stock from products table', async () => {
    if (!hasDb()) return;

    await withTestOrder({ productName: 'Stock Deduction Test', quantity: 3, unitPrice: 100, initialStock: 20 }, async ({ productId, oid }) => {
      const { rows } = await pool.query('SELECT stock FROM products WHERE id = $1', [productId]);
      expect(rows[0].stock).toBe(17); // 20 - 3
    });
  });

  it('should record stock movement for audit trail', async () => {
    if (!hasDb()) return;

    await withTestOrder({ productName: 'Audit Trail Test', quantity: 5, unitPrice: 200, initialStock: 30 }, async ({ productId, stockMovementsBefore, oid }) => {
      const { rows } = await pool.query(
        'SELECT delta, reason FROM stock_movements WHERE product_id = $1 ORDER BY created_at DESC LIMIT 1',
        [productId]
      );

      expect(rows.length).toBeGreaterThan(0);
      expect(rows[0].delta).toBe(-5);
      expect(rows[0].reason).toContain(oid);
    });
  });

  it('should roll back transaction on failure (e.g. insufficient stock)', async () => {
    if (!hasDb()) return;

    const prodId = productId();
    const oid = orderId();

    await pool.query(
      `INSERT INTO products (id, name, stock, price, is_active)
       VALUES ($1, $2, $3, $4, true)`,
      [prodId, 'Insufficient Stock Test', 2, 500]
    );

    try {
      // Attempt to order more than available stock
      await expect(
        posModel.createOrder(oid, 2000, [
          { product_id: prodId, product_name: 'Insufficient Stock Test', quantity: 5, unit_price: 400, subtotal: 2000 },
        ])
      ).rejects.toThrow('Insufficient stock');

      // Verify no order was created (rollback)
      const order = await posModel.getOrderById(oid);
      expect(order).toBeNull();

      // Verify stock was not deducted (rollback)
      const { rows } = await pool.query('SELECT stock FROM products WHERE id = $1', [prodId]);
      expect(rows[0].stock).toBe(2);

      // Verify no stock movement recorded (rollback)
      const { rows: movements } = await pool.query(
        'SELECT COUNT(*)::integer AS cnt FROM stock_movements WHERE product_id = $1',
        [prodId]
      );
      expect(movements[0].cnt).toBe(0);
    } finally {
      await pool.query('DELETE FROM products WHERE id = $1', [prodId]);
    }
  });

  it('should handle orders with multiple line items', async () => {
    if (!hasDb()) return;

    const prodId1 = productId();
    const prodId2 = productId();
    const oid = orderId();

    await pool.query(
      `INSERT INTO products (id, name, stock, price, is_active) VALUES ($1, $2, $3, $4, true)`,
      [prodId1, 'Multi A', 20, 150]
    );
    await pool.query(
      `INSERT INTO products (id, name, stock, price, is_active) VALUES ($1, $2, $3, $4, true)`,
      [prodId2, 'Multi B', 30, 250]
    );

    try {
      const order = await posModel.createOrder(oid, 950, [
        { product_id: prodId1, product_name: 'Multi A', quantity: 3, unit_price: 150, subtotal: 450 },
        { product_id: prodId2, product_name: 'Multi B', quantity: 2, unit_price: 250, subtotal: 500 },
      ]);

      expect(order).toBeTruthy();
      expect(order.orderId).toBe(oid);
      expect(Number(order.totalAmount)).toBe(950);

      // Verify stock deductions
      const { rows: stock1 } = await pool.query('SELECT stock FROM products WHERE id = $1', [prodId1]);
      expect(stock1[0].stock).toBe(17); // 20 - 3

      const { rows: stock2 } = await pool.query('SELECT stock FROM products WHERE id = $1', [prodId2]);
      expect(stock2[0].stock).toBe(28); // 30 - 2

      // Verify both items in the order
      const fetched = await posModel.getOrderById(oid);
      expect(fetched.items).toHaveLength(2);
    } finally {
      await pool.query('DELETE FROM order_items WHERE order_id = $1', [oid]);
      await pool.query('DELETE FROM orders WHERE order_id = $1', [oid]);
      await pool.query('DELETE FROM stock_movements WHERE product_id IN ($1, $2)', [prodId1, prodId2]);
      await pool.query('DELETE FROM products WHERE id IN ($1, $2)', [prodId1, prodId2]);
    }
  });

  it('should throw error if orderId is empty', async () => {
    if (!hasDb()) return;

    await expect(
      posModel.createOrder('', 100, [{ product_id: 1, product_name: 'Test', quantity: 1, unit_price: 100, subtotal: 100 }])
    ).rejects.toThrow('Order ID is required');
  });

  it('should throw error if items array is empty', async () => {
    if (!hasDb()) return;

    await expect(
      posModel.createOrder(orderId(), 0, [])
    ).rejects.toThrow('Order must have at least one item');
  });
});

// ============================================================
// POS Model — Edge case: order with single item
// ============================================================
describe('posModel - single item order', () => {
  it('should create and retrieve an order with exactly one item', async () => {
    if (!hasDb()) return;

    await withTestOrder({ productName: 'Single Item', quantity: 1, unitPrice: 999, initialStock: 10 }, async ({ oid }) => {
      const fetched = await posModel.getOrderById(oid);
      expect(fetched).toBeTruthy();
      expect(fetched.items).toHaveLength(1);
      expect(fetched.items[0].productName).toBe('Single Item');
      expect(Number(fetched.items[0].unitPrice)).toBe(999);
      expect(fetched.items[0].quantity).toBe(1);
    });
  });
});

// ============================================================
// POS Model — Analytics: queryKpiByPeriod (moved from analyticsModel)
// ============================================================
// Guard: only run when DB credentials are available (CI may lack them)
if (hasDb()) {
describe('posModel - queryKpiByPeriod (moved from analyticsModel)', () => {
  let productId;
  let orderIdA;
  let orderIdB;

  beforeAll(async () => {
    // Ensure product exists for FK constraints on order_items
    productId = Math.floor(1_000_000 + Math.random() * 10_000_000);
    await pool.query(
      `INSERT INTO products (id, name, stock, price, is_active)
       VALUES ($1, $2, $3, $4, true)`,
      [productId, `itest-prod-${randId('p')}`, 100, 500]
    );

    // Create two orders: one ~1 day ago and one ~2 days ago
    orderIdA = `TXN-${randId('A')}`;
    orderIdB = `TXN-${randId('B')}`;

    // Insert orders
    await pool.query(
      `
      INSERT INTO public.orders (order_id, total_amount, created_at)
      VALUES ($1, $2, NOW()),
             ($3, $4, NOW() - INTERVAL '1 minute')
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
    const kpi = await posModel.queryKpiByPeriod('30d');

    expect(kpi).toHaveProperty('totalRevenue');
    expect(kpi).toHaveProperty('totalOrders');

    // totalRevenue should include our two inserted orders (250 + 100)
    // DB may have existing rows; assert at least it is >= our sum.
    expect(Number(kpi.totalRevenue)).toBeGreaterThanOrEqual(350);
    expect(Number(kpi.totalOrders)).toBeGreaterThanOrEqual(2);
  });

  it('querySalesTrendByPeriod should return daily aggregated points', async () => {
    const trend = await posModel.querySalesTrendByPeriod('7d');

    expect(trend).toHaveProperty('data');
    expect(Array.isArray(trend.data)).toBe(true);

    // Ensure at least one data point exists
    expect(trend.data.length).toBeGreaterThan(0);

    // Verify that the day containing orderIdA or orderIdB contributes
    const amounts = trend.data.map((d) => d.amount);
    expect(amounts.some((a) => typeof a === 'number' && a > 0)).toBe(true);
  });

  it('queryTransactionsByPeriod should return transactions with id/amount/createdAt', async () => {
    const out = await posModel.queryTransactionsByPeriod('30d');

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

  it('queryRecentOrdersForAi should return recent orders with nested items', async () => {
    const recentOrders = await analyticsModel.queryRecentOrdersForAi(10);

    expect(Array.isArray(recentOrders)).toBe(true);
    expect(recentOrders.length).toBeGreaterThanOrEqual(2);

    const ids = recentOrders.map((order) => order.orderId);
    expect(ids).toEqual(expect.arrayContaining([orderIdA, orderIdB]));

    const orderWithItems = recentOrders.find((order) => order.orderId === orderIdA);
    expect(orderWithItems).toBeDefined();
    expect(orderWithItems).toHaveProperty('items');
    expect(Array.isArray(orderWithItems.items)).toBe(true);
    expect(orderWithItems.items[0]).toHaveProperty('productName');
    expect(orderWithItems.items[0]).toHaveProperty('quantity');
    expect(orderWithItems.items[0]).toHaveProperty('unitPrice');
    expect(orderWithItems.items[0]).toHaveProperty('subtotal');
  });
});
}

