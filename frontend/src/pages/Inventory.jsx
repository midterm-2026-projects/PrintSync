import React, { useMemo, useState } from 'react';

import InventoryHeader from '../features/inventory/components/InventoryHeader';
import InventoryFilter from '../features/inventory/components/InventoryFilter';
import InventoryTable from '../features/inventory/components/InventoryTable';
import ItemForm from '../features/inventory/components/ItemForm';
import DesignGallery from '../features/inventory/components/DesignGallery';

export default function Inventory() {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);

    const itemCount = useMemo(() => items?.length || 0, [items]);

    const handleAdd = (newItem) => {
        setItems((prev) => [...(prev || []), newItem]);
    };

    return (
        <div>
            <InventoryHeader itemCount={itemCount} />

            <ItemForm onAdd={handleAdd} />

            <InventoryFilter
                items={items}
                onFilteredItems={(nextFiltered) => setFilteredItems(nextFiltered || [])}
            />

            <InventoryTable items={filteredItems} />

            <DesignGallery designs={[]} />
        </div>
    );
}
