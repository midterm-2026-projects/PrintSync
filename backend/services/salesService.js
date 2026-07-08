/**
 * salesService.js
 * Consolidated Service for POS and Analytics logic.
 */
import { salesPOSModel, salesAnalyticsModel } from '../models/salesModel.js';
import generateTransactionId from '../utils/generateTransactionId.js';

// ==========================================
// --- POS SERVICE LOGIC ---
// ==========================================

/**
 * Validates the items array before processing.
 */
export const validateOrderItems = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return 'Order must contain at least one item.';
  }
  for (const item of items) {
    if (!item.productId || !item.productName) {
      return 'Each item must have a productId and productName.';
    }
    if (!item.quantity || item.quantity < 1) {
      return 'Each item must have a quantity of at least 1.';
    }
    if (!item.unitPrice || item.unitPrice <= 0) {
      return 'Each item must have a unitPrice greater than 0.';
    }
  }
  return null;
};

/**
 * Calculates the grand total from cart items.
 */
export const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
};

/**
 * Structures raw cart items into the order_items shape.
 * Preserves unit_price as a snapshot.
 */
export const buildOrderItems = (orderId, items) => {
  return items.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    product_name: item.productName,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    subtotal: item.unitPrice * item.quantity,
  }));
};

/**
 * Core POS transaction processor.
 */
export const processTransaction = async (items) => {
  const validationError = validateOrderItems(items);
  if (validationError) {
    throw new Error(validationError);
  }

  const totalAmount = calculateTotal(items);
  const orderId = generateTransactionId();

  const savedOrder = await salesPOSModel.createOrder(orderId, totalAmount);

  const orderItems = buildOrderItems(orderId, items);
  await salesPOSModel.createOrderItems(orderId, orderItems);

  return {
    orderId: savedOrder.order_id,
    totalAmount: savedOrder.total_amount,
    createdAt: savedOrder.created_at,
  };
};

// ==========================================
// --- ANALYTICS SERVICE LOGIC ---
// ==========================================

/**
 * Service-layer helper: convert a Date to a local calendar day key (YYYY-MM-DD).
import salesAnalyticsModel from "../models/salesModel.js";

/**
 * Service-layer helper: convert a Date to a local calendar day key (YYYY-MM-DD).
 * (No validation/business-logic belongs in the model anymore.)
 */
function toLocalDayKey(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Service-layer helper: normalize row totals from number|string => number. */
function normalizeRowTotal(row) {
  const value = typeof row.total === "string" ? Number(row.total) : row.total;
  return value;
}

/**
 * Sales aggregation service: sums order row totals for a given target date.
 */
export function aggregateSalesByDate(orders, targetDate) {
  if (!Array.isArray(orders)) {
    throw new TypeError("orders must be an array");
  }
  if (!targetDate) {
    throw new TypeError("targetDate is required");
  }

  const target = targetDate instanceof Date ? targetDate : new Date(targetDate);
  if (!Number.isFinite(target.getTime())) {
    throw new TypeError("Invalid date input");
  }
  const targetKey = toLocalDayKey(target);

  // If there are no orders, return 0.
  if (orders.length === 0) return 0;

  let sum = 0;
  for (const row of orders) {
    if (!row) continue;

    const createdAt = row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt);
    if (!Number.isFinite(createdAt.getTime())) continue;

    if (toLocalDayKey(createdAt) !== targetKey) continue;

    const value = normalizeRowTotal(row);
    if (!Number.isFinite(value)) continue;

    sum += value;
  }

  return sum;
}

/**
 * Logic to fetch from model and aggregate.
 * Week 4 Day 1: model role is query-only (DB not wired yet).
 * Service role owns validation and business aggregation logic.
 */
export function aggregateSalesByDateFromDb(targetDate) {
  if (!targetDate) {
    throw new TypeError("targetDate is required");
  }

  const orders = salesAnalyticsModel.queryOrdersByDate(targetDate);
  if (!Array.isArray(orders)) {
    throw new TypeError("queryOrdersByDate must return an array");
  }

  return aggregateSalesByDate(orders, targetDate);
}

/**
 * Build a flat JSON object compatible with Gemini prompt requirements.
 */
export function formatAiReadySalesData(input = {}) {
 *
 * Business validation lives in the service (not the model).
 * The model is query-only and is intentionally mocked in unit tests.
 */
export function formatAiReadySalesData(input = {}) {
  // Service-layer validation (business logic)
  if (!input || typeof input !== "object") {
    throw new TypeError("input must be an object");
  }

  const { date, totalSales } = input;

  if (!date) throw new TypeError("date is required");
  if (!Number.isFinite(totalSales)) {
    throw new TypeError("totalSales must be a finite number");
  }

  // Model-layer "query/prep" stub (mocked in tests)
  const payload = salesAnalyticsModel.buildAiReadySalesDataPayload({
    date,
    totalSales,
  });

  // Ensure the returned shape is the flat Gemini-compatible payload
  return {
    date: payload.date ?? date,
    totalSales: payload.totalSales ?? totalSales,
  };
}
}
