import React from 'react';
import POSModule from './features/pos/components/POSModule';

function App() {
  // Mock inventory shared with POS for demonstration
  const mockInventory = [
    { id: 1, productName: "Cotton T-Shirt", stock: 50 },
    { id: 2, productName: "Vinyl Sticker", stock: 100 }
  ];

  return (
    <div>
      <POSModule inventory={mockInventory} />
    </div>
  );
}

export default App;