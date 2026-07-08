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
  const grandTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div aria-label="receipt">
      <h1>Receipt</h1>

      <p>
        <strong>ID:</strong>{' '}
        <span aria-label="transaction id">{transactionId}</span>
      </p>

      <p>
        <strong>Date:</strong>{' '}
        <span aria-label="receipt date">{now.toLocaleDateString()}</span>
      </p>

      <p>
        <strong>Time:</strong>{' '}
        <span aria-label="receipt time">
          {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </span>
      </p>

      <ul>
        {cartItems.map((item) => (
          <ReceiptItem key={item.id} item={item} />
        ))}
      </ul>

      <div>
        <strong>Total:</strong>{' '}
        <span aria-label="receipt grand total">₱{grandTotal}</span>
      </div>

      <button aria-label="Close receipt" onClick={onClose}>
        Close
      </button>
    </div>
  );
};

export default Receipt;