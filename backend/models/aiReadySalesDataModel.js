/**
 * AI-ready sales data model helpers.
 * Keeps validation/formatting logic importable + mockable in unit tests.
 */

function validateDate(date) {
  if (!date) throw new TypeError("date is required");
  return date;
}

function validateTotalSales(totalSales) {
  if (!Number.isFinite(totalSales)) {
    throw new TypeError("totalSales must be a finite number");
  }
  return totalSales;
}

export default {
  validateDate,
  validateTotalSales,
};
