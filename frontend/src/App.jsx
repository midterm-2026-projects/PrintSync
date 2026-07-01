import React, { useState } from 'react';

// Inventory Components
import InventoryHeader from './features/inventory/components/InventoryHeader';
import ItemForm from './features/inventory/components/ItemForm';
import InventoryTable from './features/inventory/components/InventoryTable';

// POS Components
import POSSearchBar from './features/pos/components/POSSearchBar';
import POSItemList from './features/pos/components/POSItemList';
import POSCart from './features/pos/components/POSCart';
import POSTotals from './features/pos/components/POSTotals';

// Analytics Components
import AnalyticsHeader from './features/analytics/components/AnalyticsHeader';
import KPIDisplay from './features/analytics/components/KPIDisplay';
import SalesTrendChart from './features/analytics/components/SalesTrendChart';
import TransactionHistory from './features/analytics/components/TransactionHistory';

function App() {
  // --- STATE MANAGEMENT ---

  // 1. Inventory State (Source for POS)
  const [inventory, setInventory] = useState([
    { id: '1', productName: "Cotton T-Shirt", stock: 50, price: 350, category: "Garment" },
    { id: '2', productName: "Vinyl Sticker", stock: 100, price: 50, category: "Material" }
  ]);

  // 2. POS / Cart State
  const [cart, setCart] = useState([]);
  const [posSearch, setPosSearch] = useState("");

  // 3. Analytics / Sales History State (Mocked for W2D2)
  const [salesHistory] = useState([
    { id: 'TXN-001', date: '2023-10-25', amount: 1500 },
    { id: 'TXN-002', date: '2023-10-26', amount: 3000 },
    { id: 'TXN-003', date: '2023-10-27', amount: 1200 }
  ]);

  // --- HANDLERS ---

  // Inventory Handlers
  const handleAddInventory = (newItem) => {
    setInventory([...inventory, newItem]);
  };

  // POS Handlers
  const handleAddToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.id === item.id);
      if (existing) {
        return prevCart.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (id, newQty) => {
    if (newQty < 1) setCart(cart.filter(i => i.id !== id));
    else setCart(cart.map(i => i.id === id ? { ...i, quantity: newQty } : i));
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>PRINTSYNC: Unified Management System</h1>
      <p><i>Project Capstone - Informatics and Computing Sciences</i></p>

      <hr style={{ margin: '40px 0' }} />

      {/* --- OBJECTIVE 1: INVENTORY MANAGEMENT --- */}
      <section id="inventory-module">
        <InventoryHeader itemCount={inventory.length} />
        <ItemForm onAdd={handleAddInventory} />
        <InventoryTable items={inventory} />
      </section>

      <hr style={{ margin: '60px 0', borderTop: '5px double #333' }} />

      {/* --- OBJECTIVE 2: POINT-OF-SALE --- */}
      <section id="pos-module">
        <h2>POS Sales Terminal</h2>
        <POSSearchBar value={posSearch} onChange={setPosSearch} />
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <div style={{ flex: 1 }}>
            <POSItemList 
              inventory={inventory} 
              searchQuery={posSearch} 
              onSelectItem={handleAddToCart} 
            />
          </div>
          <div style={{ flex: 1 }}>
            <POSCart cartItems={cart} onUpdateQty={handleUpdateCartQty} />
            <POSTotals cartItems={cart} />
          </div>
        </div>
      </section>

      <hr style={{ margin: '60px 0', borderTop: '5px double #333' }} />

      {/* --- OBJECTIVE 3: AI-ASSISTED ANALYTICS --- */}
      <section id="analytics-module">
        <AnalyticsHeader lastUpdated="2023-10-27" />
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
                <KPIDisplay transactions={salesHistory} />
                <TransactionHistory transactions={salesHistory} />
            </div>
            <div style={{ flex: 1 }}>
                <SalesTrendChart data={salesHistory} />
            </div>
        </div>
      </section>
    </div>
  );
}

export default App;