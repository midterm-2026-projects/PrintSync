/**
 * Inventory Management Logic - Week 1 Day 1
 */

/**
 * Instantiates the baseline inventory collection array.
 * Requirement: Must return a valid initialized state structure (empty array).
 * 
 * @returns {Array} An empty inventory collection.
 */
export const initializeInventory = () => {
  return [];
};

/**
 * Data utility function to format incoming garment and material objects.
 * Requirement: Extract correct product name and stock quantity variables.
 * 
 * @param {Object} rawItem - The raw data object (e.g., from a form or external source).
 * @returns {Object} A standardized inventory item object.
 */
export const formatInventoryItem = (rawItem) => {
  // We ensure the object is standardized regardless of the input source
  return {
    // Acceptance Criteria: Extract correct product name
    productName: rawItem.name || 'Unnamed Item',

    // Acceptance Criteria: Extract and map stock quantity
    // We map 'quantity' from the input to 'stock' for our internal state
    stock: rawItem.quantity !== undefined ? Number(rawItem.quantity) : 0,

    // Additional standardization for future use (Category/Type)
    category: rawItem.type || 'Uncategorized',

    // Unique ID generation for UI list keys (temporary for Day 1)
    id: rawItem.id || Date.now() + Math.random()
  };
};