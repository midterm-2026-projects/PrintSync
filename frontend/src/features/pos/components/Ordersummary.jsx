const OrderSummary = ({ cartItems, onCheckout }) => {
  const items = cartItems ?? [];
  const uniqueItemCount = items.length;
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const formatMoney = (value) => value.toLocaleString();

  return (
    <div>
      <h3>Order Summary</h3>

      <dl>
        <div>
          <dt>Unique Items</dt>
          <dd aria-label="unique item count">{uniqueItemCount}</dd>
        </div>
        <div>
          <dt>Total Qty</dt>
          <dd aria-label="total quantity">{totalQty}</dd>
        </div>
        <div>
          <dt>Grand Total</dt>
          <dd aria-label="grand total">₱{formatMoney(grandTotal)}</dd>
        </div>
      </dl>

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
