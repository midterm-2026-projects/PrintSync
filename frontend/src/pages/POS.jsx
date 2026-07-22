import React, { useEffect, useState } from 'react';

import POSSearchBar from '../features/pos/components/POSSearchBar';
import POSItemList from '../features/pos/components/POSItemList';
import POSCart from '../features/pos/components/POSCart';
import POSTotals from '../features/pos/components/POSTotals';
import OrderSummary from '../features/pos/components/Ordersummary';
import CheckoutModal from '../features/pos/components/Checkoutmodal';
import Receipt from '../features/pos/components/Receipt';
import TransactionHistory from '../features/pos/components/TransactionHistory';

import { getPosProducts, createPosOrder, getPosTransactions } from '../features/pos/services/posApi';
import { calculateFinancials } from '../features/pos/services/posService';

export default function POS() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Load products from backend on mount
  useEffect(() => {
    let isMounted = true;

    async function loadPosData() {
      try {
        const [loadedProducts, loadedTransactions] = await Promise.all([
          getPosProducts(),
          getPosTransactions({ limit: 50 }),
        ]);
        if (!isMounted) return;
        setProducts(loadedProducts);
        setTransactions(loadedTransactions);
      } catch (loadError) {
        if (isMounted) setError(loadError.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPosData();
    return () => { isMounted = false; };
  }, []);

  // Filter products based on search query (client-side for responsiveness)
  const filteredProducts = React.useMemo(() => {
    if (!searchQuery.trim()) return products;
    const term = searchQuery.toLowerCase().trim();
    return products.filter((p) =>
      p.productName && p.productName.toLowerCase().includes(term)
    );
  }, [products, searchQuery]);

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

  const handleConfirmOrder = async () => {
    try {
      setError('');

      // Map cart items to the API format: { product_id, quantity }
      const orderItems = cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      const order = await createPosOrder(orderItems);
      setLastOrderId(order.orderId);

      // Refresh products (to get updated stock levels)
      const refreshedProducts = await getPosProducts();
      setProducts(refreshedProducts);

      // Refresh transactions
      const refreshedTransactions = await getPosTransactions({ limit: 50 });
      setTransactions(refreshedTransactions);

      setShowCheckout(false);
      setShowReceipt(true);
    } catch (err) {
      setError(err.message);
      setShowCheckout(false);
    }
  };

  const handleCancelOrder = () => {
    setShowCheckout(false);
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setCartItems([]);
    setSearchQuery('');
    setLastOrderId(null);
  };

  if (isLoading) {
    return <p>Loading POS…</p>;
  }

  return (
    <div>
      <h2>Point of Sale</h2>

      {error && <p role="alert">{error}</p>}

      <POSSearchBar value={searchQuery} onChange={setSearchQuery} />

      <POSItemList
        inventory={filteredProducts}
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

