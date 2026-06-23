import React, { useState } from 'react';
import { initializeInventory, formatInventoryItem } from '../utils/inventoryLogic';
import InventoryTable from './InventoryTable';

const InventoryModule = () => {
  const [inventory, setInventory] = useState(initializeInventory());

  const handleAddValidItem = () => {
    const rawData = { name: "Silk Screen Mesh", quantity: 15, type: "Material" };
    const formatted = formatInventoryItem(rawData);
    setInventory([...inventory, formatted]);
  };

  const handleAddEmptyItem = () => {
    // Simulating a user submitting a form without filling it out
    const rawData = { name: "", quantity: "" };
    const formatted = formatInventoryItem(rawData);
    setInventory([...inventory, formatted]);
  };

  return (
    <div>
      <h1>Inventory Management</h1>
      <p>Member: Ma. Erica Z. Vidal | Week 1, Day 1</p>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleAddValidItem}>Add Valid Item</button>
        <button onClick={handleAddEmptyItem}>Add Item with Empty Fields</button>
        <button onClick={() => setInventory(initializeInventory())}>Reset</button>
      </div>

      <h2>Inventory Collection</h2>
      {/* Passing the state down to the separated Table component */}
      <InventoryTable items={inventory} />
    </div>
  );
};

export default InventoryModule;