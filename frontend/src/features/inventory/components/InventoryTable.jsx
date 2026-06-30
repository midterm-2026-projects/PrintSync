import React from 'react';

const InventoryTable = ({ items }) => {
  // Logic: Handle initialization state
  if (!items || items.length === 0) {
    return <p><i>Inventory is currently empty (Initialized State).</i></p>;
  }

  return (
    <table border="1" style={{ width: '100%' }}>
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Stock Quantity</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.productName}</td>
            <td>{item.stock} units</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default InventoryTable;