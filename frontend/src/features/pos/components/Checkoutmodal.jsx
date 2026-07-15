const CheckoutModal = ({ cartItems, onConfirm, onCancel }) => {
  const items = cartItems ?? [];
  const uniqueItemCount = items.length;

  const grandTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const formatMoney = (value) => value.toLocaleString();

  return (
    <div role="dialog" aria-modal="true" aria-label="Checkout confirmation">
      <h2>Order Confirmation</h2>

      <dl>
        <div>
          <dt>Unique Items</dt>
          <dd aria-label="unique item count">{uniqueItemCount}</dd>
        </div>
        <div>
          <dt>Grand Total</dt>
          <dd aria-label="checkout grand total">₱{formatMoney(grandTotal)}</dd>
        </div>
      </dl>

      <h3>Items</h3>
      <ul aria-label="checkout items">
        {items.map((item) => {
          const subtotal = item.price * item.quantity;
          return (
            <li key={item.id}>
              {item.productName} x{item.quantity} — ₱{formatMoney(subtotal)}
            </li>
          );
        })}
      </ul>

      <div>
        <button onClick={onConfirm} aria-label="Confirm order">
          Confirm Order
        </button>
        <button onClick={onCancel} aria-label="Cancel order">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CheckoutModal;