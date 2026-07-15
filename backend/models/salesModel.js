
/**
 * salesModel.js
 * Consolidated Model for POS and Analytics.
 * Since we cannot communicate with the DB yet, these functions are 
 * intentionally non-functional and meant to be mocked in unit tests.
 */

// --- POS SCHEMAS ---

/**
 * Order structure definition.
 */
export const OrderSchema = {
  order_id: '',       // string — e.g. TXN-20231027-A3F9K2
  total_amount: 0,    // number — grand total
  created_at: null,   // Date   — timestamp
};

/**
 * OrderItem structure definition.
 * Note: unit_price is 1 and subtotal is 0 to ensure unit tests 
 * recognize them as separate fields.
 */
export const OrderItemSchema = {
  order_id: '',       
  product_id: '',     
  product_name: '',   
  quantity: 0,       
  unit_price: 1,      // Snapshot at time of sale
  subtotal: 0,        // unit_price * quantity
};

// --- POS MODEL LOGIC ---

import { pool } from '../db/pool.js';

export const salesPOSModel = {
  // Saves a new order record.
  async createOrder(orderId, totalAmount) {
    const { rows } = await pool.query(
      `INSERT INTO orders (order_id, total_amount, created_at)
       VALUES ($1, $2, NOW())
       RETURNING order_id, total_amount, created_at`,
      [orderId, totalAmount]
    );
    return rows[0];
  },

  // Saves all line items for an order.
  async createOrderItems(orderId, items) {
    if (!Array.isArray(items) || items.length === 0) return;

    // Insert with one VALUES list to reduce roundtrips.
    const values = [];
    const placeholders = items.map((item, idx) => {
      const base = idx * 6;
      values.push(
        item.order_id,
        item.product_id,
        item.product_name,
        item.quantity,
        item.unit_price,
        item.subtotal
      );
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`;
    });

    const { rowCount } = await pool.query(
      `INSERT INTO order_items (
         order_id,
         product_id,
         product_name,
         quantity,
         unit_price,
         subtotal
       )
       VALUES ${placeholders.join(',')}`,
      values
    );

    return rowCount;
  },

  // Fetch order by id (optional for now)
  async getOrderById(orderId) {
    const { rows } = await pool.query(
      `SELECT order_id, total_amount, created_at
       FROM orders
       WHERE order_id = $1
       LIMIT 1`,
      [orderId]
    );

    return rows[0] || null;
  },

  // Week 4 Day 1: Transaction history (most recent first)
  async queryOrdersSortedByCreatedAtDesc() {
    const { rows } = await pool.query(
      `SELECT order_id, total_amount, created_at
       FROM orders
       ORDER BY created_at DESC`
    );
    return rows;
  },
};


// --- ANALYTICS MODEL LOGIC ---

export const salesAnalyticsModel = {
  /**
   * Query-only stub: returns raw order rows for a specific date.
   */
  queryOrdersByDate: () => {
    throw new Error("Not implemented: salesAnalyticsModel.queryOrdersByDate stub");
  },

  /**
   * Query/prep-only stub for Gemini-compatible AI payload.
   */
  buildAiReadySalesDataPayload: () => {
    throw new Error("Not implemented: salesAnalyticsModel.buildAiReadySalesDataPayload stub");
  },
};
/*
 * - Since we cannot communicate with the DB yet, these query functions are
 *   intentionally non-functional and are meant to be mocked in unit tests.
*/

export default {
  /**
   * Query-only stub: should return raw order rows for the provided target date.
   * Unit tests should mock this to return an array of rows shaped like:
   *   { createdAt: Date|string, total: number|string }
   */
  queryOrdersByDate: () => {
    throw new Error("Not implemented: model query stub");
  },

  /**
   * Query/prep-only stub for Gemini-compatible payload.
   * Unit tests should mock this to return:
   *   { date, totalSales }
   */
  buildAiReadySalesDataPayload: () => {
    throw new Error("Not implemented: model query stub");
  },
};
