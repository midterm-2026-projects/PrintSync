import React, { useState } from 'react';
import InventoryHeader from './features/inventory/components/InventoryHeader';
import InventoryAdder from './features/inventory/components/InventoryAdder';
import InventoryTable from './features/inventory/components/InventoryTable';

function App() {
  // Shared state for Inventory
  const [inventory, setInventory] = useState([]);

  // Function to update state (passed to the Adder)
  const handleAdd = (item) => setInventory([...inventory, item]);

  return (
    <div>
      <InventoryHeader itemCount={inventory.length} />
      <InventoryAdder onAdd={handleAdd} />
      <InventoryTable items={inventory} />
      
      <hr style={{ margin: '40px 0' }} />
    </div>
  );
}

export default App;