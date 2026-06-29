import React from 'react';

const InventoryAdder = ({ onAdd }) => {
  // Logic: The "Parser Utility" that standardizes raw data.
  // Handles the requirement of mapping 'name' -> 'productName' and 'quantity' -> 'stock'.
  const formatAndAdd = (rawData) => {
    const formattedItem = {
      productName: rawData.name && rawData.name.trim() !== "" ? rawData.name : 'Unnamed Item',
      stock: (rawData.quantity === undefined || rawData.quantity === null || rawData.quantity === "") 
             ? 0 : Number(rawData.quantity),
      category: rawData.type || 'Uncategorized',
      id: Math.random().toString(36).substr(2, 9)
    };
    onAdd(formattedItem);
  };

  return (
    <div id="inventory-adder-actions" style={{ marginBottom: '20px' }}>
      <button onClick={() => formatAndAdd({ name: "Cotton Tee", quantity: 50, type: "Garment" })}>
        Add Valid Item
      </button>
      <button onClick={() => formatAndAdd({ name: "", quantity: "", type: "" })}>
        Add Empty Item
      </button>
    </div>
  );
};

export default InventoryAdder;