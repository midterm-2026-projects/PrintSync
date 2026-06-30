import React from 'react';

// Absorbed logic: Defines the baseline transaction state structure
export const INITIAL_POS_STATE = {
  cart: [],
  subtotal: 0,
  tax: 0,
  total: 0
};

const POSCart = ({ cartItems }) => {
  // Logic: Handle null, undefined, or empty fields gracefully
  const safeCart = cartItems || [];

  return (
    <div id="pos-cart-section">
      <h3>Transaction Cart</h3>
      <p>Items in Cart: <span data-testid="cart-count">{safeCart.length}</span></p>
      
      {safeCart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul>
          {safeCart.map((item, idx) => (
            <li key={`${item.id}-${idx}`}>{item.productName}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default POSCart;