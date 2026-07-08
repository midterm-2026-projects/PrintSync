import { useState } from 'react';
import POSSearchBar from '../components/POSSearchBar';
import POSItemList from '../components/POSItemList';
import POSCart from '../components/POSCart';
import POSTotals from '../components/POSTotals';
import OrderSummary from '../components/Ordersummary';
import CheckoutModal from '../components/Checkoutmodal';
import Receipt from '../components/Receipt';

const POS = ({ inventory }) => {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [receiptCart, setReceiptCart] = useState(null);

  const handleAddToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === item.id);
      if (exists) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQty = (id, newQty) => {
    if (newQty < 1) setCart((prev) => prev.filter((i) => i.id !== id));
    else setCart((prev) => prev.map((i) => i.id === id ? { ...i, quantity: newQty } : i));
  };

  const handleCheckout = () => setShowModal(true);

  const handleConfirm = () => {
    setReceiptCart([...cart]);
    setCart([]);
    setShowModal(false);
  };

  const handleCloseReceipt = () => setReceiptCart(null);

  return (
    <div>
      <h2>POS Sales Terminal</h2>

      <POSSearchBar value={search} onChange={setSearch} />

      <div>
        <POSItemList
          inventory={inventory}
          searchQuery={search}
          onSelectItem={handleAddToCart}
        />
        <div>
          <POSCart cartItems={cart} onUpdateQty={handleUpdateQty} />
          <POSTotals cartItems={cart} />
          <OrderSummary cartItems={cart} onCheckout={handleCheckout} />
        </div>
      </div>

      {showModal && (
        <CheckoutModal
          cartItems={cart}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}

      {receiptCart && (
        <Receipt cartItems={receiptCart} onClose={handleCloseReceipt} />
      )}
    </div>
  );
};

export default POS;