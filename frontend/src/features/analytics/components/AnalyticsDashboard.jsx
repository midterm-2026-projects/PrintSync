import React, { useState } from 'react';
import { calculateTotalRevenue, formatCurrency } from '../utils/analyticsLogic';
import KPIStats from './KPIStats';
import TransactionTable from './TransactionTable';

const AnalyticsDashboard = () => {
  const [data, setData] = useState([
    { id: 'TXN-01', amount: 500 },
    { id: 'TXN-02', amount: 1500 }
  ]);

  const total = calculateTotalRevenue(data);
  const formattedRevenue = formatCurrency(total);

  const handleAddEmptyTransaction = () => {
    // Testing logic for "empty/missing fields"
    setData([...data, { id: 'TXN-EMPTY', amount: null }]);
  };

  return (
    <div>
      <h1>AI-Assisted Analytics</h1>
      <KPIStats revenue={formattedRevenue} count={data.length} />
      <hr />
      <button onClick={handleAddEmptyTransaction}>Add Empty Transaction</button>
      <TransactionTable transactions={data} />
    </div>
  );
};

export default AnalyticsDashboard;