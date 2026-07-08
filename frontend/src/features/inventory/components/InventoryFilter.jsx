import React, { useState, useMemo } from 'react';

// Mock data based on Week 1 & 2 definitions for testing/preview purposes
const INITIAL_INVENTORY = [
  { id: 1, name: 'Premium Cotton T-Shirt', category: 'Garment', stock: 45, price: 12.99 },
  { id: 2, name: 'Polyester Sports Jersey', category: 'Garment', stock: 8, price: 15.50 },
  { id: 3, name: 'Sublimation Ink Set (CMYK)', category: 'Material', stock: 12, price: 45.00 },
  { id: 4, name: 'Heavy Cotton Hoodie', category: 'Garment', stock: 20, price: 28.00 },
  { id: 5, name: 'A4 Transfer Paper (100pcs)', category: 'Material', stock: 0, price: 18.75 },
];

const CATEGORIES = ['All', 'Garment', 'Material'];

export default function InventoryFilter() {
  // State management for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Real-time filtering logic using useMemo for performance optimization
  const filteredInventory = useMemo(() => {
    return INITIAL_INVENTORY.filter((item) => {
      // 1. Case-insensitive text search by item name
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // 2. Category filter matching
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

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
          <label htmlFor="search" className="sr-only">Search Items</label>
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

      {/* Dynamic Item Grid / List View */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInventory.map((item) => (
            <div 
              key={item.id} 
              className="p-4 border rounded-lg hover:shadow-sm transition-shadow flex justify-between items-center"
            >
              <div>
                <h4 className="font-semibold text-gray-800">{item.name}</h4>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-gray-200 text-gray-700 rounded-full">
                  {item.category}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Stock</p>
                <p className="font-bold text-gray-800">
                  {item.stock} units
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}