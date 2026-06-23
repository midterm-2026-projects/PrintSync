import React from 'react';

const InventoryTable = ({ items }) => {
  if (!items || items.length === 0) {
    return <p><i>The inventory is currently empty (Initialized State).</i></p>;
  }

  return (
    <table border="1" cellPadding="5" style={{ width: '100%', textAlign: 'left' }}>
      <thead>
        <tr style={{ backgroundColor: '#f2f2f2' }}>
          <th>Product Name</th>
          <th>Stock Quantity</th>
          <th>Category</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.productName}</td>
            <td>{item.stock} units</td>
            <td>{item.category}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default InventoryTable;