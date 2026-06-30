import React, { useState } from 'react';
import InventoryHeader from './features/inventory/components/InventoryHeader';
import InventoryTable from './features/inventory/components/InventoryTable';
import ItemForm from './features/inventory/components/ItemForm';

function App() {
    const [inventory, setInventory] = useState([]);

    const handleAddItem = (newItem) => {
        setInventory([...inventory, newItem]);
    };

    return (
        <div style={{ padding: '20px' }}>
            <InventoryHeader itemCount={inventory.length} />

            {/* Week 2 Day 1: Interactive Form with Validation */}
            <ItemForm onAdd={handleAddItem} />

            <InventoryTable items={inventory} />
        </div>
    );
}

export default App;