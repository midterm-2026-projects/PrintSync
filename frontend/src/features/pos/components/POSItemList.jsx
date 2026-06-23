import React from 'react';

const POSItemList = ({ inventory, searchQuery, onSelectItem }) => {
  // Logic: Filter and validate inventory. Handle null/empty inventory or query.
  const getFilteredItems = () => {
    if (!inventory || !Array.isArray(inventory)) return [];
    
    const term = (searchQuery || "").toLowerCase().trim();
    if (!term) return inventory;

    return inventory.filter(item => 
      item.productName && item.productName.toLowerCase().includes(term)
    );
  };

  const items = getFilteredItems();

  if (items.length === 0) {
    return <p>No matching items found.</p>;
  }

  return (
    <table border="1">
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
            <td><button onClick={() => onSelectItem(item)}>Add to Cart</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default POSItemList;