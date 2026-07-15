import React from 'react';

const ReceiptItem = ({ item }) => {
  // Requirement: should render nothing when item is null
  if (!item) return null;

  const subtotal = item.price * item.quantity;
  const formatMoney = (value) => value.toLocaleString();

  return (
    <li aria-label={`receipt item ${item.productName}`}>
      {/* Requirement: aria-label="name of..." */}
      <div>
        <strong aria-label={`name of ${item.productName}`}>{item.productName}</strong>
      </div>

      {/* Requirement: aria-label="quantity of..." content "x2" */}
      <div aria-label={`quantity of ${item.productName}`}>x{item.quantity}</div>

      {/* Requirement: aria-label="unit price of..." content "₱350 each" */}
      <div aria-label={`unit price of ${item.productName}`}>
        ₱{formatMoney(item.price)} each
      </div>

      {/* Requirement: aria-label="subtotal for..." content "₱700" */}
      <div aria-label={`subtotal for ${item.productName}`}>
        ₱{formatMoney(subtotal)}
      </div>
    </li>
  );
};

export default ReceiptItem;
