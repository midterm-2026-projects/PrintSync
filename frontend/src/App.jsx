import React, { useState } from 'react';
import AnalyticsHeader from './features/analytics/components/AnalyticsHeader';
import KPIDisplay from './features/analytics/components/KPIDisplay';
import TransactionHistory from './features/analytics/components/TransactionHistory';
import SalesTrendChart from './features/analytics/components/SalesTrendChart';

function App() {
  // Mock data for Week 2 Day 1
  const [salesHistory] = useState([
    { date: 'Oct 01', amount: 1200 },
    { date: 'Oct 02', amount: 2500 },
    { date: 'Oct 03', amount: 1800 },
    { date: 'Oct 04', amount: 4200 },
    { date: 'Oct 05', amount: 3100 }
  ]);

  return (
    <div style={{ padding: '20px' }}>
      <AnalyticsHeader lastUpdated="2023-10-27" />

      {/* Week 1 features */}
      <KPIDisplay transactions={salesHistory} />

      {/* Week 2 feature: Visualization */}
      <SalesTrendChart data={salesHistory} />

      <hr style={{ margin: '30px 0' }} />

      <TransactionHistory transactions={salesHistory} />
    </div>
  );
}

export default App;