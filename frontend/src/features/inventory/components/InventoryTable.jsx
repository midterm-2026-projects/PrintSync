import React from 'react';

const InventoryTable = ({ items }) => {
  // Initialization Logic: Handle null or empty array
  const safeItems = items || [];

  if (safeItems.length === 0) {
    return <p><i>Inventory is currently empty (Initialized State).</i></p>;
  }

  return (
    <table border="1" style={{ width: '100%', textAlign: 'left' }}>
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Stock</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        {safeItems.map((item) => (
          <tr key={item.id}>
            <td>{item.productName}</td>
            <td>{item.stock} units</td>
            <td>₱{Number(item.price || 0).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default InventoryTable;