import React from 'react';
// Import the logic functions we implemented and tested
import { calculateTotalRevenue, formatCurrency } from '../utils/analyticsLogic';

const AnalyticsDashboard = () => {
  // Mock transaction data to demonstrate functionality
  const mockTransactions = [
    { id: 'TX001', amount: 1250.00, date: '2023-10-01' },
    { id: 'TX002', amount: 450.50, date: '2023-10-02' },
    { id: 'TX003', amount: 3000.00, date: '2023-10-03' },
    { id: 'TX004', amount: 125.75, date: '2023-10-04' },
  ];

  // Using the Core Metrics Engine to calculate the sum
  const rawTotal = calculateTotalRevenue(mockTransactions);
  
  // Using the KPI Data Parser to format the currency
  const displayTotal = formatCurrency(rawTotal);

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      
      <hr />

      <h2>Core Business KPIs</h2>
      <p>
        <strong>Total Historical Revenue:</strong> {displayTotal}
      </p>
      <p>
        <strong>Total Transaction Count:</strong> {mockTransactions.length}
      </p>

      <hr />

      <h3>Raw Transaction Data (Mock History)</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Date</th>
            <th>Raw Amount</th>
            <th>Formatted Amount</th>
          </tr>
        </thead>
        <tbody>
          {mockTransactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.id}</td>
              <td>{tx.date}</td>
              <td>{tx.amount}</td>
              <td>{formatCurrency(tx.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnalyticsDashboard;