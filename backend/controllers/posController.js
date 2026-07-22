/**
 * posController.js
 * Request handlers for POS endpoints.
 * Pure HTTP handlers — all business logic and helpers live in posService.
 */

import { posService, getErrorMessage, formatCurrency } from '../services/posService.js';

/**
 * GET /pos/products — List or search products
 * Query params: q (search), category, limit, offset
 */
export async function getProducts(req, res) {
  try {
    const { q = '', category = null, limit = 100, offset = 0 } = req.query;

    const items = await posService.getProducts(q, category, Number(limit), Number(offset));

    return res.status(200).json({
      ok: true,
      items,
      count: items.length,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: getErrorMessage(err) });
  }
}

/**
 * GET /pos/products/:id — Get single product by ID
 */
export async function getProductById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ ok: false, error: 'Product ID is required' });
    }

    const item = await posService.getProductById(id);

    return res.status(200).json({
      ok: true,
      item,
    });
  } catch (err) {
    const message = getErrorMessage(err);
    const statusCode = message.includes('not found') ? 404 : 500;
    return res.status(statusCode).json({ ok: false, error: message });
  }
}

/**
 * POST /pos/orders — Create a new order
 * Body: { items: [{ product_id, quantity }] }
 */
export async function createOrder(req, res) {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: 'Order must contain at least one item' });
    }

    const order = await posService.createOrder(items);

    return res.status(201).json({
      ok: true,
      order,
    });
  } catch (err) {
    const message = getErrorMessage(err);
    const statusCode =
      message.includes('not found') || message.includes('Insufficient stock') || message.includes('Invalid quantity') || message.includes('must have a')
        ? 400
        : 500;
    return res.status(statusCode).json({ ok: false, error: message });
  }
}

/**
 * GET /pos/orders — List all orders (transaction history)
 * Query params: limit, offset
 */
export async function getOrders(req, res) {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const orders = await posService.getTransactions(Number(limit), Number(offset));

    return res.status(200).json({
      ok: true,
      orders,
      count: orders.length,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: getErrorMessage(err) });
  }
}

/**
 * DELETE /pos/orders/:orderId — Delete an order (for test cleanup)
 */
export async function deleteOrderById(req, res) {
  try {
    const { orderId } = req.params;

    if (!orderId || !orderId.trim()) {
      return res.status(400).json({ ok: false, error: 'Order ID is required' });
    }

    await posService.deleteOrder(orderId);

    return res.status(200).json({ ok: true, message: 'Order deleted successfully' });
  } catch (err) {
    const message = getErrorMessage(err);
    const statusCode = message.includes('not found') ? 404 : 500;
    return res.status(statusCode).json({ ok: false, error: message });
  }
}

/**
 * GET /pos/orders/:orderId — Get single order with line items
 */
export async function getOrderById(req, res) {
  try {
    const { orderId } = req.params;

    if (!orderId || !orderId.trim()) {
      return res.status(400).json({ ok: false, error: 'Order ID is required' });
    }

    const order = await posService.getOrderById(orderId);

    return res.status(200).json({
      ok: true,
      order,
    });
  } catch (err) {
    const message = getErrorMessage(err);
    const statusCode = message.includes('not found') ? 404 : 500;
    return res.status(statusCode).json({ ok: false, error: message });
  }
}

/**
 * GET /pos/transactions — Alias for getOrders
 */
export { getOrders as getTransactions };

