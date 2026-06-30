import React from 'react';

const POSCart = ({ cartItems = [], onUpdateQty }) => {
  return (
    <div id="pos-cart-section">
      <h3>Transaction Cart</h3>
      <p>Items in Cart: <span data-testid="cart-count">{cartItems.length}</span></p>
      
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <table border="1" style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id}>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>
                  <button onClick={() => onUpdateQty(item.id, item.quantity + 1)}>+</button>
                  <button onClick={() => onUpdateQty(item.id, item.quantity - 1)}>-</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default POSCart;