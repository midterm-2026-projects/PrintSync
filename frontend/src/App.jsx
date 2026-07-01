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
  // --- GLOBAL STATE ---

  // 1. Inventory State (The source for the POS)
  const [inventory, setInventory] = useState([
    { id: '1', productName: "Cotton T-Shirt", stock: 50, price: 350, category: "Garment" },
    { id: '2', productName: "Vinyl Sticker", stock: 100, price: 50, category: "Material" }
  ]);

  // 2. Mock Design Data for Gallery
  const [designs] = useState([
    { id: 101, title: 'Team Logo', url: 'https://via.placeholder.com/600/771796' },
    { id: 102, title: 'Summer Print', url: 'https://via.placeholder.com/600/24f355' },
    { id: 103, title: 'Retro Badge', url: 'https://via.placeholder.com/600/d32776' }
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

  // Inventory logic: Adding item from Form
  const handleAddInventory = (newItem) => {
    setInventory([...inventory, newItem]);
  };

  // POS logic: Add to cart (handling duplicates)
  const handleAddToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === item.id);
      if (exists) {
        return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // POS logic: Update quantities or remove
  const handleUpdateCartQty = (id, newQty) => {
    if (newQty < 1) setCart(cart.filter(i => i.id !== id));
    else setCart(cart.map(i => i.id === id ? { ...i, quantity: newQty } : i));
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1300px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>PRINTSYNC: A Cloud-Based Inventory & POS System</h1>
        <p><strong>Capstone Project Progress Dashboard</strong></p>
      </header>

      {/* --- OBJECTIVE 1: INVENTORY MANAGEMENT (ERICA) --- */}
      <section style={{ border: '2px solid blue', padding: '20px', marginBottom: '30px', borderRadius: '8px' }}>
        <InventoryHeader itemCount={inventory.length} />
        <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
          <div style={{ flex: '1' }}>
            <ItemForm onAdd={handleAddInventory} />
            <InventoryTable items={inventory} />
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
            {/* POSTotals now uses the POS Service internally for logic */}
            <POSTotals cartItems={cart} />
          </div>
        </div>
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