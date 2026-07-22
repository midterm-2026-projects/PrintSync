/**
 * posModel.js
 * Database query functions for Point-of-Sale operations.
 * Uses Supabase PostgreSQL via the shared pool.
 */

import { pool } from '../db/pool.js';

export const posModel = {
  /**
   * Get all active products with optional category filter and pagination.
   */
  async queryRecentOrdersForAi(limit = 15) {
    const { rows } = await pool.query(
      `
      SELECT
        o.order_id AS "orderId",
        o.created_at AS "createdAt",
        o.total_amount::numeric AS "totalAmount",
        COALESCE(json_agg(json_build_object(
          'productName', oi.product_name,
          'quantity', oi.quantity,
          'unitPrice', oi.unit_price::numeric,
          'subtotal', oi.subtotal::numeric
        ) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
      FROM public.orders o
      LEFT JOIN public.order_items oi ON o.order_id = oi.order_id
      GROUP BY o.order_id, o.created_at, o.total_amount
      ORDER BY o.created_at DESC
      LIMIT $1
    `,
      [limit]
    );

    return (rows ?? []).map((r) => ({
      orderId: r.orderId,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      totalAmount: Number(r.totalAmount),
      items: Array.isArray(r.items) ? r.items.map((it) => ({
        productName: it.productName,
        quantity: it.quantity,
        unitPrice: Number(it.unitPrice),
        subtotal: Number(it.subtotal),
      })) : [],
    }));
  },

  async getAllProducts(filters = {}) {
    const { category, limit = 100, offset = 0 } = filters;

    let query = `SELECT id, name AS "productName", price, stock, category, image_url
                 FROM products
                 WHERE is_active = true`;
    const params = [];

    if (category) {
      query += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC
              LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    return rows;
  },

  /**
   * Search active products by name (case-insensitive).
   */
  async searchProducts(searchQuery, filters = {}) {
    const { category, limit = 100, offset = 0 } = filters;

    let query = `SELECT id, name AS "productName", price, stock, category, image_url
                 FROM products
                 WHERE is_active = true AND LOWER(name) LIKE LOWER($1)`;
    const params = [`%${searchQuery}%`];

    if (category) {
      query += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC
              LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    return rows;
  },

  /**
   * Get single product by ID.
   */
  async getProductById(id) {
    if (id === undefined || id === null) {
      throw new Error('Product ID cannot be null');
    }

    const { rows } = await pool.query(
      `SELECT id, name AS "productName", price, stock, category, image_url
       FROM products
       WHERE id = $1 AND is_active = true
       LIMIT 1`,
      [id]
    );

    return rows[0] || null;
  },

  /**
   * Create an order with its line items in a single transaction.
   * Also deducts stock and records stock movements for audit.
   *
   * @param {string} orderId - Generated order ID (e.g. TXN-20250101-A3F9K2)
   * @param {number} totalAmount - Computed grand total
   * @param {Array} items - Array of { product_id, product_name, quantity, unit_price, subtotal }
   */
  async createOrder(orderId, totalAmount, items) {
    if (!orderId) throw new Error('Order ID is required');
    if (!items || items.length === 0) throw new Error('Order must have at least one item');

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Insert the order
      const { rows: orderRows } = await client.query(
        `INSERT INTO orders (order_id, total_amount)
         VALUES ($1, $2)
         RETURNING order_id AS "orderId", total_amount AS "totalAmount", created_at AS "createdAt"`,
        [orderId, totalAmount]
      );

      // Insert each order item, update stock, and record stock movement
      for (const item of items) {
        const { product_id, product_name, quantity, unit_price, subtotal } = item;

        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [orderId, product_id, product_name, quantity, unit_price, subtotal]
        );

        // Deduct stock
        const { rows: updatedProduct } = await client.query(
          `UPDATE products
           SET stock = stock - $1, updated_at = NOW()
           WHERE id = $2 AND stock >= $1
           RETURNING id, name, stock`,
          [quantity, product_id]
        );

        if (updatedProduct.length === 0) {
          throw new Error(`Insufficient stock for product ID ${product_id}`);
        }

        // Record stock movement for audit
        await client.query(
          `INSERT INTO stock_movements (product_id, delta, reason, performed_by)
           VALUES ($1, $2, $3, $4)`,
          [product_id, -quantity, `Order ${orderId}`, 'pos']
        );
      }

      await client.query('COMMIT');

      return orderRows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Get paginated list of orders with item counts (transaction history).
   */
  async getAllOrders(limit = 50, offset = 0) {
    const { rows } = await pool.query(
      `SELECT o.order_id AS id,
              o.total_amount AS "totalAmount",
              o.created_at AS "createdAt",
              COALESCE(SUM(oi.quantity), 0)::integer AS "itemsCount"
       FROM orders o
       LEFT JOIN order_items oi ON o.order_id = oi.order_id
       GROUP BY o.order_id, o.total_amount, o.created_at
       ORDER BY o.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // pg returns numeric columns as strings; convert to proper JS types
    return rows.map((row) => ({
      ...row,
      totalAmount: Number(row.totalAmount),
      itemsCount: Number(row.itemsCount),
    }));
  },

  /**
   * Get KPI (total revenue + number of orders) within a period.
   * Used by analytics endpoints.
   *
   * @param {string} _period - Normalized period string (e.g. '30d')
   * @param {string} interval - Postgres interval string (e.g. '30 days')
   * @returns {Promise<{totalRevenue: number, totalOrders: number}>}
   */
  async queryKpiByPeriod(_period = '30d', interval = '30 days') {
    const { rows } = await pool.query(
      `
      SELECT
        COALESCE(SUM(total_amount), 0) AS "totalRevenue",
        COUNT(order_id) AS "totalOrders"
      FROM public.orders
      WHERE created_at >= NOW() - $1::interval
    `,
      [interval]
    );

    const raw = rows?.[0];
    if (!raw) return { totalRevenue: 0, totalOrders: 0 };
    return {
      totalRevenue: Number(raw.totalRevenue) || 0,
      totalOrders: Number(raw.totalOrders) || 0,
    };
  },

  /**
   * Get daily sales trend (series of totals) within a period.
   * Used by analytics endpoints.
   *
   * @param {string} _period - Normalized period string (e.g. '30d')
   * @param {string} interval - Postgres interval string (e.g. '30 days')
   * @returns {Promise<{data: Array<{date: string, amount: number}>}>}
   */
  async querySalesTrendByPeriod(_period = '30d', interval = '30 days') {
    const { rows } = await pool.query(
      `
      SELECT
        to_char(created_at::date, 'YYYY-MM-DD') AS "date",
        SUM(total_amount)::numeric AS "amount"
      FROM public.orders
      WHERE created_at >= NOW() - $1::interval
      GROUP BY created_at::date
      ORDER BY created_at::date ASC
    `,
      [interval]
    );

    return {
      data: (rows ?? []).map((r) => ({
        date: r.date,
        amount: Number(r.amount),
      })),
    };
  },

  /**
   * Get list of transactions (id + amount + createdAt) within a period.
   * Used by analytics endpoints.
   *
   * @param {string} _period - Normalized period string (e.g. '30d')
   * @param {string} interval - Postgres interval string (e.g. '30 days')
   * @returns {Promise<{transactions: Array<{id: string, amount: number, createdAt: string}>}>}
   */
  async queryTransactionsByPeriod(_period = '30d', interval = '30 days') {
    const { rows } = await pool.query(
      `
      SELECT
        order_id AS "id",
        total_amount::numeric AS "amount",
        created_at AS "createdAt"
      FROM public.orders
      WHERE created_at >= NOW() - $1::interval
      ORDER BY created_at DESC
    `,
      [interval]
    );

    return {
      transactions: (rows ?? []).map((r) => ({
        id: r.id,
        amount: Number(r.amount),
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      })),
    };
  },

  /**
   * Delete an order and its associated order_items (cascade delete).
   * Used for test cleanup.
   *
   * @param {string} orderId - The order ID to delete
   * @returns {Promise<boolean>} true if deleted, false if not found
   */
  async deleteOrder(orderId) {
    if (!orderId) throw new Error('Order ID cannot be empty');

    const { rows } = await pool.query(
      `DELETE FROM public.orders WHERE order_id = $1 RETURNING order_id`,
      [orderId]
    );

    return rows.length > 0;
  },

  /**
   * Get single order with its line items.
   */
  async getOrderById(orderId) {
    if (!orderId) throw new Error('Order ID cannot be empty');

    // Get order header
    const { rows: orderRows } = await pool.query(
      `SELECT order_id AS "orderId",
              total_amount AS "totalAmount",
              created_at AS "createdAt"
       FROM orders
       WHERE order_id = $1
       LIMIT 1`,
      [orderId]
    );

    if (orderRows.length === 0) return null;

    const order = orderRows[0];

    // Get order items
    const { rows: itemRows } = await pool.query(
      `SELECT id,
              product_id AS "productId",
              product_name AS "productName",
              quantity,
              unit_price AS "unitPrice",
              subtotal
       FROM order_items
       WHERE order_id = $1
       ORDER BY id ASC`,
      [orderId]
    );

    return {
      ...order,
      createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
      items: itemRows.map((r) => ({
        ...r,
        unitPrice: Number(r.unitPrice),
        subtotal: Number(r.subtotal),
      })),
    };
  },
};

