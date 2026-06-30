import React from 'react';

const InventoryHeader = ({ itemCount }) => {
  return (
    <div>
      <h1>Inventory Management</h1>
      <p>
        <strong>Total Unique Items:</strong> 
        {/* The test looks specifically for this data-testid */}
        <span data-testid="item-count">{itemCount || 0}</span>
      </p>
    </div>
  );
};

export default InventoryHeader;