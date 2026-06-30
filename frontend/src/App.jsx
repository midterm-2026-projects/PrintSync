import React, { useState } from 'react';
import POSItemList from './features/pos/components/POSItemList';
import POSCart from './features/pos/components/POSCart';

function App() {
  const [cart, setCart] = useState([]);
  
  // Mock Inventory for POS
  const inventory = [
    { id: 101, productName: "Vinyl Sticker", stock: 100 },
    { id: 102, productName: "Custom Cap", stock: 20 }
  ];

  // Logic Requirement: Increment quantity if duplicate, else add new row
  const handleAddToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  // Logic Requirement: Remove from cart if quantity falls below 1
  const handleUpdateQty = (id, newQty) => {
    if (newQty < 1) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>PrintSync POS</h1>
      
      <POSItemList 
        inventory={inventory} 
        searchQuery="" 
        onSelectItem={handleAddToCart} 
      />

      <hr style={{ margin: '30px 0' }} />

      <POSCart 
        cartItems={cart} 
        onUpdateQty={handleUpdateQty} 
      />
    </div>
  );
}

export default App;