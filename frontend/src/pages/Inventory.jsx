import React, { useEffect, useMemo, useState } from 'react';

import InventoryHeader from '../features/inventory/components/InventoryHeader';
import InventoryFilter from '../features/inventory/components/InventoryFilter';
import InventoryTable from '../features/inventory/components/InventoryTable';
import ItemForm from '../features/inventory/components/ItemForm';
import DesignGallery from '../features/inventory/components/DesignGallery';
import {
    adjustInventoryStock,
    createInventoryItem,
    getInventoryDesigns,
    getInventoryItems,
} from '../features/inventory/services/inventoryApi';

export default function Inventory() {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [designs, setDesigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingItemId, setUpdatingItemId] = useState(null);

    const itemCount = useMemo(() => items?.length || 0, [items]);

    useEffect(() => {
        let isMounted = true;

        async function loadInventory() {
            try {
                const [loadedItems, loadedDesigns] = await Promise.all([
                    getInventoryItems(),
                    getInventoryDesigns(),
                ]);
                if (!isMounted) return;
                setItems(loadedItems);
                setDesigns(loadedDesigns);
            } catch (loadError) {
                if (isMounted) setError(loadError.message);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        loadInventory();
        return () => { isMounted = false; };
    }, []);

    const handleAdd = async (newItem) => {
        setError('');
        const createdItem = await createInventoryItem(newItem);
        setItems((prev) => [createdItem, ...(prev || [])]);
    };

    const handleAdjustStock = async (item, delta) => {
        setError('');
        setUpdatingItemId(item.id);
        try {
            const updatedItem = await adjustInventoryStock(item.id, delta);
            setItems((prev) => prev.map((currentItem) => (
                currentItem.id === item.id ? { ...currentItem, ...updatedItem } : currentItem
            )));
        } catch (updateError) {
            setError(updateError.message);
        } finally {
            setUpdatingItemId(null);
        }
    };

    return (
        <div>
            <InventoryHeader itemCount={itemCount} />

            {error && <p role="alert">{error}</p>}
            {isLoading && <p>Loading inventory…</p>}
            <ItemForm onAdd={handleAdd} />

            <InventoryFilter
                items={items}
                onFilteredItems={(nextFiltered) => setFilteredItems(nextFiltered || [])}
            />

            <InventoryTable
                items={filteredItems}
                onAdjustStock={handleAdjustStock}
                updatingItemId={updatingItemId}
            />

            <DesignGallery designs={designs} />
        </div>
    );
}
