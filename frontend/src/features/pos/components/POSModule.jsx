import React, { useState } from 'react';
import { initializePOS, validateAndRetrieveItem } from '../utils/posLogic';
import POSItemList from './POSItemList';

const POSModule = ({ inventory = [] }) => {
  const [posState, setPosState] = useState(initializePOS());
  const [searchQuery, setSearchQuery] = useState("");

  // Retrieve items based on current search
  const filteredItems = validateAndRetrieveItem(inventory, searchQuery);

  const handleSelectItem = (item) => {
    setPosState(prev => ({
      ...prev,
      cart: [...prev.cart, item]
    }));
  };

  return (
    <div>
      <h1>Point-of-Sale (POS) Terminal</h1>
      <p>Member: Lyell Jasmine D. Bulan | Week 1, Day 1</p>

      <section>
        <input 
          type="text" 
          placeholder="Search inventory..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={() => setPosState(initializePOS())}>Reset Transaction</button>
      </section>

      <hr />

      <POSItemList items={filteredItems} onSelectItem={handleSelectItem} />

      <hr />

      <section id="cart-summary">
        <h3>Current Cart Items: {posState.cart.length}</h3>
        <ul>
          {posState.cart.map((item, idx) => (
            <li key={idx}>{item.productName}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default POSModule;