import React from 'react';
import InventoryAdder from './features/inventory/components/InventoryAdder';
import InventoryHeader from './features/inventory/components/InventoryHeader';
import InventoryTable from './features/inventory/components/InventoryTable';

function App() {
  return (
    <div>
      <InventoryHeader />
      <InventoryAdder />
      <InventoryTable />
    </div>
  );
}

export default App;