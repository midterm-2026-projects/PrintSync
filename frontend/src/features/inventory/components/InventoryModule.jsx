import React, { useState } from 'react';
import { initializeInventory, formatInventoryItem } from '../utils/inventoryLogic';

const InventoryModule = () => {
  // Use the tested initialization function
  const [inventory, setInventory] = useState(initializeInventory());

  // Simulation: Take raw data and pass it through the tested parser
  const handleAddItem = () => {
    const rawData = {
      name: "Standard Cotton Tee",
      quantity: Math.floor(Math.random() * 100) + 1, // Simulated raw input variable
      type: "Garment"
    };

    const formattedItem = formatInventoryItem(rawData);
    setInventory([...inventory, formattedItem]);
  };

  return (
    <div>
      <h1>Inventory Management</h1>

      <section>
        <h2>Actions</h2>
        <button onClick={handleAddItem}>Add Formatted Item (Simulated)</button>
        <button onClick={() => setInventory(initializeInventory())}>Clear/Initialize</button>
      </section>

      <hr />

      <section>
        <h2>Inventory Table</h2>
        {inventory.length === 0 ? (
          <p><i>The inventory is currently empty (Initialized State).</i></p>
        ) : (
          <table border="1" cellPadding="5" style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th>Product Name</th>
                <th>Stock Quantity</th>
                <th>Category</th>
                <th>Internal ID</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id}>
                  {/* Requirement: Extract correct product name */}
                  <td>{item.productName}</td>
                  
                  {/* Requirement: Extract and return correct stock quantity */}
                  <td>{item.stock} units</td>
                  
                  <td>{item.category}</td>
                  <td><small>{item.id}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default InventoryModule;