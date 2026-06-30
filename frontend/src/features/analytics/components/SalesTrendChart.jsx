import React from 'react';

const SalesTrendChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return <p><i>No data available for chart visualization.</i></p>;
  }

  // Chart Dimensions
  const width = 600;
  const height = 250;
  const padding = 60;

  // Scaling Logic
  const maxAmount = Math.max(...data.map(d => d.amount), 1);
  
  // Calculate coordinates for all points
  const chartPoints = data.map((d, i) => {
    const x = padding + (i * (width - padding * 2) / (data.length - 1 || 1));
    const y = height - padding - (d.amount / maxAmount * (height - padding * 2));
    return { x, y, amount: d.amount, date: d.date };
  });

  // String format for the polyline 'points' attribute
  const polylinePoints = chartPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div id="sales-trend-viz" style={{ marginTop: '20px' }}>
      <h3>Sales Volume Trend</h3>
      <svg 
        data-testid="sales-line-chart"
        width={width} 
        height={height} 
        style={{ border: '1px solid black', background: '#fff' }}
      >
        {/* Y-Axis Label */}
        <text x="10" y="25" fontSize="14" fontFamily="Arial">Y: Amount</text>

        {/* X-Axis Label */}
        <text x={width - 70} y={height - 15} fontSize="14" fontFamily="Arial">X: Date</text>

        {/* The Black Line */}
        <polyline
          data-testid="chart-polyline"
          fill="none"
          stroke="black"
          strokeWidth="2"
          points={polylinePoints}
        />

        {/* Data Points (Red Dots) and Labels (Amounts) */}
        {chartPoints.map((p, i) => (
          <g key={i}>
            {/* The Red Dot */}
            <circle 
              key={`dot-${i}`}
              data-testid="chart-dot" // Added for explicit testing
              cx={p.x} 
              cy={p.y} 
              r="6" 
              fill="red" 
            />
            
            {/* The Amount Label (e.g., ₱3000) */}
            <text 
              x={p.x + 8} 
              y={p.y - 5} 
              fontSize="12" 
              fontFamily="Arial"
            >
              ₱{p.amount}
            </text>

            {/* The Date Label on X-Axis */}
            <text 
              x={p.x} 
              y={height - 15} 
              fontSize="12" 
              fontFamily="Arial" 
              textAnchor="middle"
            >
              {p.date}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default SalesTrendChart;