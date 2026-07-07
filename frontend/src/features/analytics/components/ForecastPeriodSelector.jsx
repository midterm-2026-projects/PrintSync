import React from 'react';

const DEFAULT_PERIOD = '30d';

const ForecastPeriodSelector = ({ value = DEFAULT_PERIOD, onChange }) => {
  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  return (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
        Forecasting Period
      </label>
      <select
        aria-label="Forecasting Period"
        value={value}
        onChange={handleChange}
        style={{ padding: '8px', minWidth: '220px' }}
      >
        <option value="7d">Last 7 Days</option>
        <option value="30d">Last 30 Days</option>
        <option value="90d">Last 90 Days</option>
      </select>
    </div>
  );
};

export default ForecastPeriodSelector;
