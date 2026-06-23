/**
 * Core metrics calculation engine for Analytics Framework
 */

/**
 * Calculates the total revenue from an array of transaction objects.
 * Requirement: Must be a pure function and not mutate the input state.
 * 
 * @param {Array} transactions - Array of objects containing an 'amount' property.
 * @returns {number} The mathematically accurate sum of all amounts.
 */
export const calculateTotalRevenue = (transactions) => {
  if (!transactions || !Array.isArray(transactions)) {
    return 0;
  }

  // Using reduce to aggregate values without modifying the original array
  return transactions.reduce((accumulator, current) => {
    return accumulator + (current.amount || 0);
  }, 0);
};

/**
 * Formats a numeric value into a standardized Philippine Peso string.
 * Requirement: Prefix '₱', comma separators, and exactly two decimal places.
 * 
 * @param {number} amount - The raw numeric value.
 * @returns {string} Formatted string (e.g., "₱1,250.00").
 */
export const formatCurrency = (amount) => {
  // Use toLocaleString to handle comma separators and decimal precision
  const formattedNumber = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `₱${formattedNumber}`;
};