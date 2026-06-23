import React from 'react';

const KPIStats = ({ revenue, count }) => {
  return (
    <div id="kpi-section">
      <p><strong>Total Historical Revenue:</strong> {revenue}</p>
      <p><strong>Total Orders:</strong> {count}</p>
    </div>
  );
};

export default KPIStats;