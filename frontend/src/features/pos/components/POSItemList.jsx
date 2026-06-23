import React from 'react';

const POSItemList = ({ items, onSelectItem }) => {
  if (!items || items.length === 0) {
    return <p>No matching items found in inventory.</p>;
  }

  return (
    <div id="pos-item-selection">
      <h3>Selectable Items</h3>
      <table border="1" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Stock</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.productName}</td>
              <td>{item.stock}</td>
              <td>
                <button onClick={() => onSelectItem(item)}>Add to Cart</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default POSItemList;