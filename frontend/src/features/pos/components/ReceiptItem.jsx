import React from 'react';

const ReceiptItem = ({ item }) => {
  // Requirement: should render nothing when item is null
  if (!item) return null;

  const subtotal = item.price * item.quantity;

  return (
    <li>
      {/* Requirement: aria-label="name of..." */}
      <span aria-label={`name of ${item.productName}`}>
        {item.productName}
      </span>

      {/* Requirement: aria-label="quantity of..." content "x2" */}
      <span aria-label={`quantity of ${item.productName}`}>
        x{item.quantity}
      </span>

      {/* Requirement: aria-label="unit price of..." content "₱350 each" */}
      <span aria-label={`unit price of ${item.productName}`}>
        ₱{item.price} each
      </span>

      {/* Requirement: aria-label="subtotal for..." content "₱700" */}
      <span aria-label={`subtotal for ${item.productName}`}>
        ₱{subtotal}
      </span>
    </li>
  );
};

export default ReceiptItem;