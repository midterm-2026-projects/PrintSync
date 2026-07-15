import React, { useMemo } from 'react';
import ReceiptItem from './ReceiptItem';

const Receipt = ({ cartItems, onClose }) => {
  // Requirement: Transaction ID in format TXN-YYYYMMDD-XXXXXX
  const transactionId = useMemo(() => {
    const now = new Date();
    const datePart = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 chars
    return `TXN-${datePart}-${randomPart}`;
  }, []);

  const now = new Date();

  // Requirement: Calculate grand total (₱750 for the mock data)
  const grandTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const formatMoney = (value) => value.toLocaleString();

  return (
    <div aria-label="receipt">
      <h1>Receipt</h1>

      <dl>
        <div>
          <dt>ID</dt>
          <dd aria-label="transaction id">{transactionId}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd aria-label="receipt date">{now.toLocaleDateString()}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd aria-label="receipt time">
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </dd>
        </div>
      </dl>

      <ul aria-label="receipt items">
        {cartItems.map((item) => (
          <ReceiptItem key={item.id} item={item} />
        ))}
      </ul>

      <dl>
        <div>
          <dt>Total</dt>
          <dd aria-label="receipt grand total">₱{formatMoney(grandTotal)}</dd>
        </div>
      </dl>

      <button aria-label="Close receipt" onClick={onClose}>
        Close
      </button>
    </div>
  );
};

export default Receipt;