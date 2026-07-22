/**
 * posService.js
 * Business logic for Point-of-Sale operations.
 * All helper functions live here — controllers only handle HTTP.
 */

import { posModel } from '../models/posModel.js';

/**
 * Safely extract an error message from an unknown error type.
 * @param {unknown} err
 * @returns {string}
 */
export function getErrorMessage(err) {
  return err instanceof Error ? err.message : 'Unknown error';
}

/**
 * Generate a unique transaction ID in format TXN-YYYYMMDD-XXXXXX.
 * Example: TXN-20250127-A3F9K2
 * @returns {string}
 */
export function generateTransactionId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${datePart}-${randomPart}`;
}

/**
 * Format a currency number for display (kept in service for reuse).
 * @param {number} val
 * @returns {string}
 */
export function formatCurrency(val) {
  const safe = typeof val === 'number' && Number.isFinite(val) ? val : 0;
  return `₱${safe.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Validate and compute totals for an order.
 * Returns enriched items with product_name, unit_price, subtotal
 * and the computed totalAmount.
 *
 * @param {Array} items - [{ product_id, quantity }]
 * @returns {Promise<{ enrichedItems: Array, totalAmount: number }>}
 */
export async function validateAndEnrichOrderItems(items) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  const enrichedItems = [];

  for (const item of items) {
    const { product_id, quantity } = item;

    if (!product_id) {
      throw new Error('Each order item must have a product_id');
    }
    if (quantity === undefined || quantity === null || !Number.isInteger(quantity) || quantity < 1) {
      throw new Error(`Invalid quantity for product ID ${product_id}: must be a positive integer`);
    }

    // Fetch current product data from DB
    const product = await posModel.getProductById(product_id);
    if (!product) {
      throw new Error(`Product not found with ID: ${product_id}`);
    }

    // Check stock sufficiency
    if (product.stock < quantity) {
      throw new Error(
        `Insufficient stock for "${product.productName}": requested ${quantity}, available ${product.stock}`
      );
    }

    const unitPrice = Number(product.price);
    const subtotal = unitPrice * quantity;

    enrichedItems.push({
      product_id: Number(product_id),
      product_name: product.productName,
      quantity,
      unit_price: unitPrice,
      subtotal,
    });
  }

  const totalAmount = enrichedItems.reduce((sum, item) => sum + item.subtotal, 0);

  return { enrichedItems, totalAmount };
}

export const posService = {
  /**
   * List or search products.
   */
  async getProducts(query = '', category = null, limit = 100, offset = 0) {
    if (query && query.trim()) {
      return await posModel.searchProducts(query, { category, limit, offset });
    }
    return await posModel.getAllProducts({ category, limit, offset });
  },

  /**
   * Get single product by ID.
   */
  async getProductById(id) {
    if (id === undefined || id === null) {
      throw new Error('Product ID is required');
    }
    const product = await posModel.getProductById(id);
    if (!product) {
      throw new Error(`Product not found with id: ${id}`);
    }
    return product;
  },

  /**
   * Create a new order with stock deduction and audit trail.
   *
   * @param {Array} items - [{ product_id, quantity }]
   * @returns {Promise<Object>} The created order
   */
  async createOrder(items) {
    // Validate and enrich items with prices from DB
    const { enrichedItems, totalAmount } = await validateAndEnrichOrderItems(items);

    // Generate unique transaction ID
    const orderId = generateTransactionId();

    // Persist order transactionally
    const order = await posModel.createOrder(orderId, totalAmount, enrichedItems);

    return order;
  },

  /**
   * Get paginated transaction history.
   */
  async getTransactions(limit = 50, offset = 0) {
    return await posModel.getAllOrders(limit, offset);
  },

  /**
   * Delete an order by ID (for test cleanup).
   */
  async deleteOrder(orderId) {
    if (!orderId || !orderId.trim()) {
      throw new Error('Order ID is required');
    }
    const deleted = await posModel.deleteOrder(orderId);
    if (!deleted) {
      throw new Error(`Order not found with id: ${orderId}`);
    }
    return deleted;
  },

  /**
   * Get single order with line items.
   */
  async getOrderById(orderId) {
    if (!orderId || !orderId.trim()) {
      throw new Error('Order ID is required');
    }
    const order = await posModel.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order not found with id: ${orderId}`);
    }
    return order;
  },
};

