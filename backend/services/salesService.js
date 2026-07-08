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

// Sales aggregation service: sums order row totals for a given target date.
// Expected order row shape (minimal):
//  - createdAt: Date|string
//  - total: number|string
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
