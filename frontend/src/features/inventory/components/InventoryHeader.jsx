import React from 'react';

const InventoryHeader = ({ itemCount }) => {
  return (
    <div>
      <h1>Inventory Management</h1>
      <p><strong>Total Unique Items:</strong> {itemCount || 0}</p>
    </div>
  );
};

export default InventoryHeader;