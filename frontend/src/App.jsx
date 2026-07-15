import { useState } from 'react';

// --- INVENTORY COMPONENTS (Erica) ---
import InventoryHeader from './features/inventory/components/InventoryHeader';
import ItemForm from './features/inventory/components/ItemForm';
import InventoryTable from './features/inventory/components/InventoryTable';
import DesignGallery from './features/inventory/components/DesignGallery';
import InventoryFilter from './features/inventory/components/InventoryFilter';

// --- POS (Lyell) ---
import POSSearchBar from './features/pos/components/POSSearchBar';
import POSItemList from './features/pos/components/POSItemList';
import POSCart from './features/pos/components/POSCart';
import POSTotals from './features/pos/components/POSTotals';
import Ordersummary from './features/pos/components/Ordersummary';
import Checkoutmodal from './features/pos/components/Checkoutmodal';
import Receipt from './features/pos/components/Receipt';
import TransactionHistoryDetail from './features/pos/components/TransactionHistoryDetail';
import OrderStatusTracker from './features/pos/components/OrderStatusTracker';
import OrderProgressIndicator from './features/pos/components/OrderProgressIndicator';

// --- ANALYTICS COMPONENTS (Roi) ---
import AnalyticsHeader from './features/analytics/components/AnalyticsHeader';
import KPIDisplay from './features/analytics/components/KPIDisplay';
import TransactionHistory from './features/analytics/components/TransactionHistory';
import SalesTrendChart from './features/analytics/components/SalesTrendChart';
import AIInsightArea from './features/analytics/components/AIInsightArea';
import ForecastPeriodSelector from './features/analytics/components/ForecastPeriodSelector';
import PredictedDemandTable from './features/analytics/components/PredictedDemandTable';

function App() {
  // --- GLOBAL STATE ---

  // 1. Inventory State (The source for the POS)
  const [inventory, setInventory] = useState([
    { id: '1', productName: "Cotton T-Shirt", stock: 50, price: 350, category: "Garment" },
    { id: '2', productName: "Vinyl Sticker", stock: 100, price: 50, category: "Material" }
  ]);

  // Inventory list shown in the table (driven by InventoryFilter)
  const [filteredInventory, setFilteredInventory] = useState(inventory);

  // 2. Mock Design Data for Gallery
  const [designs] = useState([
    { id: 101, title: 'Team Logo', url: 'https://via.placeholder.com/600/771796' },
    { id: 102, title: 'Summer Print', url: 'https://via.placeholder.com/600/24f355' },
    { id: 103, title: 'Retro Badge', url: 'https://via.placeholder.com/600/d32776' }
  ]);

  // 3. POS States
  const [cart, setCart] = useState([]);
  const [posSearch, setPosSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [receiptCart, setReceiptCart] = useState(null);

  // 4. Analytics Mock History
  const [salesHistory] = useState([
    { id: 'TXN-001', date: '2023-10-25', amount: 1500 },
    { id: 'TXN-002', date: '2023-10-26', amount: 3000 },
    { id: 'TXN-003', date: '2023-10-27', amount: 1200 }
  ]);

  // 5. Week 3 Day 1 Forecasting UI State
  const [forecastPeriod, setForecastPeriod] = useState('30d');

  // 6. Week 4 Mock Data - Transaction History & Order Status
  const [transactions] = useState([
    {
      id: 'TXN-20260715-ABC123',
      timestamp: '2026-07-15T14:30:00',
      totalAmount: 700.00,
      status: 'Completed',
      itemsCount: 2
    },
    {
      id: 'TXN-20260715-DEF456',
      timestamp: '2026-07-15T12:15:00',
      totalAmount: 1050.50,
      status: 'Completed',
      itemsCount: 3
    },
    {
      id: 'TXN-20260715-GHI789',
      timestamp: '2026-07-15T10:45:00',
      totalAmount: 350.00,
      status: 'Pending',
      itemsCount: 1
    }
  ]);
  const [currentOrderStatus, setCurrentOrderStatus] = useState('Pending');
  const [currentOrderId] = useState('TXN-20260715-ABC123');

  // --- HANDLERS ---

  // Inventory logic: Adding item from Form
  const handleAddInventory = (newItem) => {
    setInventory([...inventory, newItem]);
  };

  // POS handlers
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

  const handleUpdateCartQty = (id, newQty) => {
    if (newQty < 1) setCart((prev) => prev.filter((i) => i.id !== id));
    else setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)));
  };

  const handleCheckout = () => setShowModal(true);

  const handleConfirm = () => {
    setReceiptCart([...cart]);
    setCart([]);
    setShowModal(false);
  };

  const handleCloseReceipt = () => setReceiptCart(null);

  return (
    <div style={{ padding: '30px', maxWidth: '1300px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>PRINTSYNC: A Cloud-Based Inventory & POS System</h1>
        <p><strong>Capstone Project Progress Dashboard</strong></p>
      </header>

      {/* --- OBJECTIVE 1: INVENTORY MANAGEMENT (ERICA) --- */}
      <section style={{ border: '2px solid blue', padding: '20px', marginBottom: '30px', borderRadius: '8px' }}>
        <InventoryHeader itemCount={inventory.length} />

        {/* Week 3 Day 1 - Inventory Filter */}
        <InventoryFilter items={inventory} onFilteredItems={setFilteredInventory} />

        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <div style={{ flex: '1' }}>
            <ItemForm onAdd={handleAddInventory} />
            <InventoryTable items={filteredInventory} />
          </div>

          <div style={{ flex: '1', borderLeft: '1px solid #ccc', paddingLeft: '20px' }}>
            <DesignGallery designs={designs} />
          </div>
        </div>
      </section>
      

      {/* --- OBJECTIVE 2: POINT-OF-SALE (LYELL) --- */}
      <section style={{ border: '2px solid green', padding: '20px', marginBottom: '30px', borderRadius: '8px' }}>
        <h2>POS Sales Terminal</h2>

        <POSSearchBar value={posSearch} onChange={setPosSearch} />

        <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
          <div style={{ flex: '1.5' }}>
            <POSItemList
              inventory={inventory}
              searchQuery={posSearch}
              onSelectItem={handleAddToCart}
            />
          </div>

          <div style={{ flex: '1', backgroundColor: '#f9f9f9', padding: '15px' }}>
            <POSCart cartItems={cart} onUpdateQty={handleUpdateCartQty} />
            <POSTotals cartItems={cart} />
            <Ordersummary cartItems={cart} onCheckout={handleCheckout} />
          </div>
        </div>

        {showModal && (
          <Checkoutmodal
            cartItems={cart}
            onConfirm={handleConfirm}
            onCancel={() => setShowModal(false)}
          />
        )}

        {receiptCart && (
          <Receipt cartItems={receiptCart} onClose={handleCloseReceipt} />
        )}

        {/* --- WEEK 4: Transaction History & Order Tracking --- */}
        <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '8px' }}>
            <TransactionHistoryDetail transactions={transactions} />
          </div>
          <div style={{ backgroundColor: '#fffef0', padding: '15px', borderRadius: '8px' }}>
            <div style={{ marginBottom: '20px' }}>
              <OrderStatusTracker orderStatus={currentOrderStatus} orderId={currentOrderId} />
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button onClick={() => setCurrentOrderStatus('Pending')} style={{ padding: '8px 16px' }}>Set Pending</button>
                <button onClick={() => setCurrentOrderStatus('Completed')} style={{ padding: '8px 16px' }}>Set Completed</button>
              </div>
            </div>
            <OrderProgressIndicator currentStatus={currentOrderStatus} orderId={currentOrderId} />
          </div>
        </div>

        {showModal && (
          <Checkoutmodal
            cartItems={cart}
            onConfirm={handleConfirm}
            onCancel={() => setShowModal(false)}
          />
        )}

        {receiptCart && (
          <Receipt cartItems={receiptCart} onClose={handleCloseReceipt} />
        )}
      </section>

      {/* --- OBJECTIVE 3: ANALYTICS (ROI) --- */}
      <section style={{ border: '2px solid purple', padding: '20px', borderRadius: '8px' }}>
        <AnalyticsHeader lastUpdated="2023-10-27" />
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <KPIDisplay transactions={salesHistory} />
            <TransactionHistory transactions={salesHistory} />
          </div>
          <div style={{ flex: '1', minWidth: '400px' }}>
            <SalesTrendChart data={salesHistory} />
            <AIInsightArea />

            <div style={{ marginTop: '20px' }}>
              <ForecastPeriodSelector value={forecastPeriod} onChange={setForecastPeriod} />
              <PredictedDemandTable period={forecastPeriod} />
            </div>
          </div>
        </div>
      </section>

      <footer style={{ marginTop: '40px', textAlign: 'center', fontSize: '0.8rem', color: '#666' }}>
        <p>© 2023 College of Informatics and Computing Sciences</p>
      </footer>
    </div>
  );
}

export default App;