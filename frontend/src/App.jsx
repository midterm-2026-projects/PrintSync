import React, { useState } from 'react';

// Import Lyell's POS Components
import POSSearchBar from './features/pos/components/POSSearchBar';
import POSItemList from './features/pos/components/POSItemList';
import POSCart from './features/pos/components/POSCart';

function App() {
  // --- MOCK DATA FOR POS ---
  const mockInventory = [
    { id: 101, productName: "Custom Blue T-Shirt", stock: 25 },
    { id: 102, productName: "Red Hoodie", stock: 12 },
    { id: 103, productName: "Vinyl Sticker Pack", stock: 100 },
    { id: 104, productName: "Canvas Tote Bag", stock: 45 },
  ];

  // --- POS INDEPENDENT STATE ---
  const [posSearch, setPosSearch] = useState("");
  const [cartItems, setCartItems] = useState([]);

  // Function to handle adding items to the cart
  const handleSelectItem = (item) => {
    setCartItems([...cartItems, item]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* POS MODULE SECTION */}
      <div id="pos-module-container">
        <h1>POS Terminal</h1>
        <p>Member: Lyell Jasmine D. Bulan</p>
        
        {/* 1. Search Bar: Logic absorbed (handles input) */}
        <POSSearchBar 
          value={posSearch} 
          onChange={setPosSearch} 
        />

        <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
          {/* 2. Item List: Logic absorbed (handles filtering) */}
          <div style={{ flex: 2 }}>
            <POSItemList 
              inventory={mockInventory} 
              searchQuery={posSearch} 
              onSelectItem={handleSelectItem} 
            />
          </div>

          {/* 3. Cart: Logic absorbed (handles empty state & display) */}
          <div style={{ flex: 1, borderLeft: '1px solid #ccc', paddingLeft: '20px' }}>
            <POSCart cartItems={cartItems} />
            
            <button 
              style={{ marginTop: '10px' }}
              onClick={() => setCartItems([])}
            >
              Clear Sale
            </button>
          </div>
        </div>
      </div>

      {/* 
         Independent Area for Other Members:
         Erica (Inventory) and Roi (Analytics) components can be added 
         above or below this div without affecting the POS state.
      */}
      
    </div>
  );
}

export default App;