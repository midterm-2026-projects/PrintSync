import React from 'react';

const AnalyticsHeader = ({ lastUpdated }) => {
  // Logic: Handle null or empty dates
  const status = lastUpdated ? `Last updated: ${lastUpdated}` : "Status: No Data Available";

  return (
    <div id="analytics-header">
      <h1>AI-Assisted Business Analytics</h1>
      <p>Member: Roi C. Rendal | Week 1, Day 1</p>
      <p><i>{status}</i></p>
    </div>
  );
};

export default AnalyticsHeader;