import salesAggregationModel from "../models/salesAggregationModel.js";

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

  // Validate target date first so invalid input throws even when orders is empty.
  const target = salesAggregationModel.toValidDate(targetDate);
  const targetKey = salesAggregationModel.toLocalDayKey(target);

  // Happy-path behavior requested: if there are no orders, return 0.
  if (orders.length === 0) return 0;

  let sum = 0;
  for (const row of orders) {
    if (!row) continue;

    const rowDate = salesAggregationModel.toValidDate(row.createdAt);
    if (salesAggregationModel.toLocalDayKey(rowDate) !== targetKey) continue;

    const value = salesAggregationModel.normalizeRowTotal(row);
    if (!Number.isFinite(value)) continue;

    sum += value;
  }

  return sum;
}
