import React from 'react';

const InventoryAdder = ({ onAdd }) => {
  // Absorbed Logic: The Parser
  const parseAndSubmit = (name, qty) => {
    const newItem = {
      productName: name || 'Unnamed Item',
      stock: qty === "" ? 0 : Number(qty),
      category: 'General',
      id: Math.random().toString(36).substr(2, 9)
    };
    
    // Triggers the state update in App.jsx
    onAdd(newItem);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <button onClick={() => parseAndSubmit("Cotton Tee", 50)}>
        Add Valid Item
      </button>
      <button onClick={() => parseAndSubmit("", "")}>
        Add Empty Item
      </button>
    </div>
  );
};

export default InventoryAdder;