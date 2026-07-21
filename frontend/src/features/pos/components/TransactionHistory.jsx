import React from 'react';

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  try {
    const d = new Date(timestamp);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString();
  } catch {
    return 'N/A';
  }
};

const formatCurrency = (amount) => {
  const safe = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
  return `₱${safe.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * POS Transaction History (compartment-level)
 *
 * Expected transaction shape (best-effort):
 * { id, timestamp, totalAmount, status, itemsCount }
 */
const TransactionHistory = ({ transactions }) => {
  const safeList = transactions || [];

  if (safeList.length === 0) {
    return <p>No transaction history found.</p>;
  }

  return (
    <div id="pos-transaction-history">
      <h4>Transaction History</h4>
      <table border="1" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Timestamp</th>
            <th>Total</th>
            <th>Items</th>

          </tr>
        </thead>
        <tbody>
          {safeList.map((tx, idx) => (
            <tr key={tx?.id || idx}>
              <td>{tx?.id || 'N/A'}</td>
              <td>{formatTimestamp(tx?.timestamp)}</td>
              <td>{formatCurrency(tx?.totalAmount)}</td>
              <td>{typeof tx?.itemsCount === 'number' ? tx.itemsCount : 'N/A'}</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;

