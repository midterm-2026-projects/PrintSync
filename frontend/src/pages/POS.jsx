import React, { useState } from 'react';

import POSSearchBar from '../features/pos/components/POSSearchBar';
import POSItemList from '../features/pos/components/POSItemList';
import POSCart from '../features/pos/components/POSCart';
import POSTotals from '../features/pos/components/POSTotals';
import OrderSummary from '../features/pos/components/Ordersummary';
import CheckoutModal from '../features/pos/components/Checkoutmodal';
import Receipt from '../features/pos/components/Receipt';
import TransactionHistory from '../features/pos/components/TransactionHistory';

import generateTransactionId from '../features/pos/services/generatetransactionId';
import { calculateFinancials, formatCurrency } from '../features/pos/services/posService';

const SAMPLE_INVENTORY = [
  { id: 1, productName: 'Cotton T-Shirt', price: 350, stock: 50 },
  { id: 2, productName: 'Polo Shirt', price: 450, stock: 30 },
  { id: 3, productName: 'Hoodie', price: 750, stock: 20 },
  { id: 4, productName: 'Mug', price: 250, stock: 100 },
  { id: 5, productName: 'Cap', price: 300, stock: 40 },
];

export default function POS() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const handleSelectItem = (item) => {
    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQty = (id, newQty) => {
    if (newQty <= 0) {
      setCartItems((prev) => prev.filter((ci) => ci.id !== id));
      return;
    }
    setCartItems((prev) =>
      prev.map((ci) => (ci.id === id ? { ...ci, quantity: newQty } : ci))
    );
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleConfirmOrder = () => {
    const transactionId = generateTransactionId();
    const { total } = calculateFinancials(cartItems, 12);

    const newTransaction = {
      id: transactionId,
      timestamp: new Date().toISOString(),
      totalAmount: total,
      status: 'completed',
      itemsCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    };

    setTransactions((prev) => [...prev, newTransaction]);
    setShowCheckout(false);
    setShowReceipt(true);
  };

  const handleCancelOrder = () => {
    setShowCheckout(false);
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setCartItems([]);
    setSearchQuery('');
  };

  return (
    <div>
      <h2>Point of Sale</h2>

      <POSSearchBar value={searchQuery} onChange={setSearchQuery} />

      <POSItemList
        inventory={SAMPLE_INVENTORY}
        searchQuery={searchQuery}
        onSelectItem={handleSelectItem}
      />

      <POSCart cartItems={cartItems} onUpdateQty={handleUpdateQty} />

      <POSTotals cartItems={cartItems} />

      <OrderSummary cartItems={cartItems} onCheckout={handleCheckout} />

      {showCheckout && (
        <CheckoutModal
          cartItems={cartItems}
          onConfirm={handleConfirmOrder}
          onCancel={handleCancelOrder}
        />
      )}

      {showReceipt && (
        <Receipt cartItems={cartItems} onClose={handleCloseReceipt} />
      )}

      <TransactionHistory transactions={transactions} />
    </div>
  );
}

