const OrderSummary = ({ cartItems, onCheckout }) => {
  const items = cartItems ?? [];
  const uniqueItemCount = items.length;
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const grandTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div>
      <h3>Order Summary</h3>
      <div>
        <span>Unique Items:</span>
        <span aria-label="unique item count">{uniqueItemCount}</span>
      </div>
      <div>
        <span>Total Qty:</span>
        <span aria-label="total quantity">{totalQty}</span>
      </div>
      <div>
        <span>Grand Total:</span>
        <span aria-label="grand total">₱{grandTotal.toLocaleString()}</span>
      </div>
      <button
        onClick={onCheckout}
        disabled={items.length === 0}
        aria-label="Proceed to checkout"
      >
        Checkout
      </button>
    </div>
  );
};

export default OrderSummary;