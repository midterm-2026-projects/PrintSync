import React, { useState } from 'react';

const ItemForm = ({ onAdd }) => {
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Validation Logic (Absorbed)
    if (!name.trim()) {
      setError("Error: Item name is required.");
      return;
    }

    if (stock !== "" && Number(stock) < 0) {
      setError("Error: Stock cannot be negative.");
      return;
    }

    // Standardization Logic (Absorbed)
    const newItem = {
      productName: name.trim(),
      stock: stock === "" ? 0 : Number(stock),
      category: "Manual Entry",
      id: Math.random().toString(36).substr(2, 9)
    };

    onAdd(newItem);
    
    // Clear form
    setName("");
    setStock("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
      <h3>Add New Item</h3>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <label htmlFor="item-name">Item Name:</label>
        <input 
          id="item-name"
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
      </div>

      <div style={{ marginTop: '10px' }}>
        <label htmlFor="item-stock">Initial Stock:</label>
        <input 
          id="item-stock"
          type="number" 
          value={stock} 
          onChange={(e) => setStock(e.target.value)} 
        />
      </div>

      <button type="submit" style={{ marginTop: '10px' }}>Add Item</button>
    </form>
  );
};

export default ItemForm;