import React from 'react';

const TransactionHistory = ({ transactions }) => {
  // Logic: Handling empty/null fields for the list display
  const safeList = transactions || [];

  if (safeList.length === 0) {
    return <p>No transaction history found to aggregate.</p>;
  }

  return (
    <div id="transaction-history">
      <h4>Raw Transaction Log</h4>
      <table border="1" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Amount (Raw)</th>
          </tr>
        </thead>
        <tbody>
          {safeList.map((tx, idx) => (
            <tr key={tx.id || idx}>
              <td>{tx.id || 'N/A'}</td>
              <td>{tx.amount !== undefined && tx.amount !== null ? `₱${tx.amount}` : '₱0.00'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;