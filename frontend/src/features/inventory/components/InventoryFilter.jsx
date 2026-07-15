import { useEffect, useMemo, useState } from 'react';

// Keep the filter buttons stable even if the incoming inventory categories differ.
const CATEGORIES = ['All', 'Garment', 'Material'];

export default function InventoryFilter({ items = [], onFilteredItems }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredItems = useMemo(() => {
    const safeItems = items || [];
    return safeItems.filter((item) => {
      const name = (item?.productName ?? '').toLowerCase();
      const category = item?.category ?? '';

      const matchesSearch = name.includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  useEffect(() => {
    if (typeof onFilteredItems === 'function') onFilteredItems(filteredItems);
  }, [filteredItems, onFilteredItems]);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">PRINTSYNC Inventory</h2>
        <p className="text-sm text-gray-500">Search and filter custom print designs and materials.</p>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b pb-4">
        {/* Sub-task 1: Text-based Search Bar */}
        <div className="w-full sm:w-1/2">
          <label htmlFor="search" className="sr-only">
            Search Items
          </label>
          <input
            id="search"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Search items by name (e.g., Cotton)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Sub-task 2: Category Filter Menu */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Category:</span>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  selectedCategory === category
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Intentionally no item grid/list here.
          The inventory list now lives in InventoryTable, which receives filtered items from the parent. */}
      <div className="text-sm text-gray-600">
        {filteredItems.length} item(s) matched.
      </div>
    </div>
  );
}
