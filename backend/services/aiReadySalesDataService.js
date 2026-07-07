import aiReadySalesDataModel from "../models/aiReadySalesDataModel.js";

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
  const payload = aiReadySalesDataModel.buildAiReadySalesDataPayload({
    date,
    totalSales,
  });

  // Ensure the returned shape is the flat Gemini-compatible payload
  return {
    date: payload.date ?? date,
    totalSales: payload.totalSales ?? totalSales,
  };
}
