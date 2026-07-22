import React from 'react';

const KPIDisplay = ({ transactions, totalRevenue, totalOrders }) => {
  // Logic: KPI Calculation Engine (Summing amounts)
  // Acceptance Criteria: Handle mathematically accurate sum and empty fields
  const calculateTotal = (data) => {
    if (!data || !Array.isArray(data)) return 0;
    return data.reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0);
  };

  // Logic: Currency Formatter Utility
  // Acceptance Criteria: Prefix '₱', commas, and exactly two decimal places
  const formatValue = (val) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(val || 0).replace('PHP', '₱').trim();
  };

  // Support both direct props (from Analytics page connected to backend)
  // and the legacy transactions-based calculation (for existing tests)
  const displayRevenue = totalRevenue !== undefined ? totalRevenue : calculateTotal(transactions);
  const displayOrders = totalOrders !== undefined ? totalOrders : (transactions?.length || 0);

  return (
    <div id="kpi-container" style={{ padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
      <h3>Core Business Metrics</h3>
      <p>
        <strong>Total Historical Revenue: </strong>
        <span data-testid="revenue-total">{formatValue(displayRevenue)}</span>
      </p>
      <p>Total Orders Processed: {displayOrders}</p>
    </div>
  );
};

export default KPIDisplay;

