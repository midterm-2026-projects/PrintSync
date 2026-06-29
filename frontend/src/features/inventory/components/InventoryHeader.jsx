import React from 'react';

const InventoryHeader = ({ itemCount }) => {
  // Logic: Handle null or undefined counts gracefully
  const displayCount = itemCount || 0;

  return (
    <div id="inventory-header">
      <h1>Inventory Management</h1>
      <p>Member: Ma. Erica Z. Vidal | Week 1, Day 1</p>
      <p><strong>Total Unique Items:</strong> <span data-testid="item-count">{displayCount}</span></p>
    </div>
  );
};

export default InventoryHeader;