const CheckoutModal = ({ cartItems, onConfirm, onCancel }) => {
  const items = cartItems ?? [];
  const uniqueItemCount = items.length;
  const grandTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div role="dialog" aria-modal="true" aria-label="Checkout confirmation">
      <h2>Order Confirmation</h2>

      <div>
        <span>Unique Items:</span>
        <span aria-label="unique item count">{uniqueItemCount}</span>
      </div>
      <div>
        <span>Grand Total:</span>
        <span aria-label="checkout grand total">₱{grandTotal.toLocaleString()}</span>
      </div>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.productName} x{item.quantity} — ₱{(item.price * item.quantity).toLocaleString()}
          </li>
        ))}
      </ul>

      <button onClick={onConfirm} aria-label="Confirm order">Confirm Order</button>
      <button onClick={onCancel} aria-label="Cancel order">Cancel</button>
    </div>
  );
};

export default CheckoutModal;