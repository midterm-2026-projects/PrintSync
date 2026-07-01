import React, { useState } from 'react';

// --- INVENTORY COMPONENTS (Erica) ---
import InventoryHeader from './features/inventory/components/InventoryHeader';
import ItemForm from './features/inventory/components/ItemForm';
import InventoryTable from './features/inventory/components/InventoryTable';
import DesignGallery from './features/inventory/components/DesignGallery';

// --- POS COMPONENTS (Lyell) ---
import POSSearchBar from './features/pos/components/POSSearchBar';
import POSItemList from './features/pos/components/POSItemList';
import POSCart from './features/pos/components/POSCart';
import POSTotals from './features/pos/components/POSTotals';

// --- ANALYTICS COMPONENTS (Roi) ---
import AnalyticsHeader from './features/analytics/components/AnalyticsHeader';
import KPIDisplay from './features/analytics/components/KPIDisplay';
import TransactionHistory from './features/analytics/components/TransactionHistory';
import SalesTrendChart from './features/analytics/components/SalesTrendChart';
import AIInsightArea from './features/analytics/components/AIInsightArea';

function App() {
  // --- STATE ---

  // 1. Inventory State
  const [inventory, setInventory] = useState([
    { id: '1', productName: "Cotton T-Shirt", stock: 50, price: 350, category: "Garment" },
    { id: '2', productName: "Vinyl Sticker", stock: 100, price: 50, category: "Material" }
  ]);

  // 2. Design Gallery Mock Data
  const [designs] = useState([
    { id: 10, title: 'Sport Logo', url: 'https://via.placeholder.com/600/771796' },
    { id: 11, title: 'Corporate Crest', url: 'https://via.placeholder.com/600/24f355' }
  ]);

  // 3. POS States
  const [cart, setCart] = useState([]);
  const [posSearch, setPosSearch] = useState("");

  // 4. Analytics Mock History
  const [salesHistory] = useState([
    { id: 'TXN-001', date: '2023-10-25', amount: 1500 },
    { id: 'TXN-002', date: '2023-10-26', amount: 3000 },
    { id: 'TXN-003', date: '2023-10-27', amount: 1200 }
  ]);

  // --- HANDLERS ---

  // Inventory logic
  const handleAddInventory = (newItem) => setInventory([...inventory, newItem]);

  // POS logic (W2D1 duplicate handling + W2D2 totals)
  const handleAddToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === item.id);
      if (exists) return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (id, newQty) => {
    if (newQty < 1) setCart(cart.filter(i => i.id !== id));
    else setCart(cart.map(i => i.id === id ? { ...i, quantity: newQty } : i));
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1>PRINTSYNC UNIFIED DASHBOARD</h1>
        <p>Progress Update: Week 2, Day 2</p>
      </header>

      {/* --- OBJECTIVE 1: INVENTORY MANAGEMENT --- */}
      <section style={{ border: '2px solid blue', padding: '20px', marginBottom: '40px' }}>
        <InventoryHeader itemCount={inventory.length} />
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <ItemForm onAdd={handleAddInventory} />
            <InventoryTable items={inventory} />
          </div>
          <div style={{ flex: 1 }}>
            <DesignGallery designs={designs} />
          </div>
        </div>
      </section>

      {/* --- OBJECTIVE 2: POINT-OF-SALE --- */}
      <section style={{ border: '2px solid green', padding: '20px', marginBottom: '40px' }}>
        <h2>POS Terminal</h2>
        <POSSearchBar value={posSearch} onChange={setPosSearch} />
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <div style={{ flex: 1 }}>
            <POSItemList inventory={inventory} searchQuery={posSearch} onSelectItem={handleAddToCart} />
          </div>
          <div style={{ flex: 1 }}>
            <POSCart cartItems={cart} onUpdateQty={handleUpdateCartQty} />
            <POSTotals cartItems={cart} />
          </div>
        </div>
      </section>

      {/* --- OBJECTIVE 3: AI-ASSISTED ANALYTICS --- */}
      <section style={{ border: '2px solid purple', padding: '20px' }}>
        <AnalyticsHeader lastUpdated="2023-10-27" />
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <KPIDisplay transactions={salesHistory} />
            <SalesTrendChart data={salesHistory} />
          </div>
          <div style={{ flex: 1 }}>
            <AIInsightArea />
            <TransactionHistory transactions={salesHistory} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;