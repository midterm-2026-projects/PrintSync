export const initializeInventory = () => [];

export const formatInventoryItem = (rawItem) => {
  // If the entire object is missing, return a safe default
  if (!rawItem) {
    return { productName: 'Unknown Item', stock: 0, category: 'Uncategorized', id: Date.now() };
  }

  return {
    // Check if name is empty/whitespace or missing
    productName: rawItem.name && rawItem.name.trim() !== "" 
      ? rawItem.name 
      : 'Unnamed Item',

    // Ensure stock is a number and handles empty/null quantity
    stock: (rawItem.quantity === undefined || rawItem.quantity === null || rawItem.quantity === "")
      ? 0 
      : Number(rawItem.quantity),

    category: rawItem.type || 'Uncategorized',
    id: rawItem.id || Math.random().toString(36).substr(2, 9)
  };
};