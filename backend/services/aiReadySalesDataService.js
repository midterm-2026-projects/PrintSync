import aiReadySalesDataModel from "../models/aiReadySalesDataModel.js";

/**
 * Build a flat JSON object compatible with Gemini prompt requirements.
 *
 * This intentionally performs no network/database calls.
 */
export function formatAiReadySalesData({ date, totalSales } = {}) {
  const validatedDate = aiReadySalesDataModel.validateDate(date);
  const validatedTotalSales = aiReadySalesDataModel.validateTotalSales(totalSales);

  return {
    date: validatedDate,
    totalSales: validatedTotalSales,
  };
}
