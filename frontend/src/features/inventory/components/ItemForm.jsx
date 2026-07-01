import React, { useState } from 'react';

const ItemForm = ({ onAdd }) => {
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState(""); // New state for price
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Error: Item name is required.");
      return;
    }

    // Requirement: Validation for negative numbers
    if (Number(stock) < 0 || Number(price) < 0) {
      setError("Error: Stock and Price cannot be negative.");
      return;
    }

    const newItem = {
      productName: name.trim(),
      stock: stock === "" ? 0 : Number(stock),
      price: price === "" ? 0 : Number(price), // Pass price to the system
      category: "Manual Entry",
      id: Math.random().toString(36).substr(2, 9)
    };

    onAdd(newItem);
    
    setName("");
    setStock("");
    setPrice("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
      <h3>Add New Inventory Item</h3>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <label htmlFor="item-name">Item Name:</label>
        <input id="item-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div style={{ marginTop: '10px' }}>
        <label htmlFor="item-stock">Initial Stock:</label>
        <input id="item-stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
      </div>

      {/* NEW PRICE FIELD */}
      <div style={{ marginTop: '10px' }}>
        <label htmlFor="item-price">Unit Price (₱):</label>
        <input id="item-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>

      <button type="submit" style={{ marginTop: '10px' }}>Add to Inventory</button>
    </form>
  );
};

export default ItemForm;