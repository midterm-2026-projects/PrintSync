import React from 'react';

const KPIDisplay = ({ transactions }) => {
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

  const totalRevenue = calculateTotal(transactions);

  return (
    <div id="kpi-container" style={{ padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
      <h3>Core Business Metrics</h3>
      <p>
        <strong>Total Historical Revenue: </strong>
        <span data-testid="revenue-total">{formatValue(totalRevenue)}</span>
      </p>
      <p>Total Orders Processed: {transactions?.length || 0}</p>
    </div>
  );
};

export default KPIDisplay;