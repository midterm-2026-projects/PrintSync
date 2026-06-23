/**
 * POS Logic - Week 1 Day 1
 */

// Requirement: Initialize baseline transaction state (empty cart, zeroed totals)
export const initializePOS = () => {
  return {
    cart: [],
    subtotal: 0,
    tax: 0,
    total: 0
  };
};

/**
 * Requirement: Filter, validate, and retrieve selectable inventory items.
 * Must safely return matching items without throwing undefined errors.
 */
export const validateAndRetrieveItem = (inventory, query) => {
  // Edge Case: If inventory is missing or empty
  if (!inventory || !Array.isArray(inventory)) return [];

  // Edge Case: If query is empty/null, return all items
  if (!query || query.trim() === "") return inventory;

  const searchTerm = query.toLowerCase().trim();

  return inventory.filter(item => 
    item.productName && item.productName.toLowerCase().includes(searchTerm)
  );
};