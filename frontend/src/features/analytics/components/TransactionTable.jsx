import React from 'react';

const TransactionTable = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <p>No transaction history available.</p>;
  }

  return (
    <table border="1">
      <thead>
        <tr>
          <th>ID</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx, idx) => (
          <tr key={idx}>
            <td>{tx.id || 'N/A'}</td>
            <td>{tx.amount ? `₱${tx.amount}` : '₱0.00'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TransactionTable;