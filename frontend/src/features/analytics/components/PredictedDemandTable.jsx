import React, { useMemo } from 'react';

const CATEGORIES = [
  { category: 'Cotton T-Shirt', baseQty: 60 },
  { category: 'Polo Shirt', baseQty: 45 },
  { category: 'Hoodie', baseQty: 30 },
];

const periodMultiplier = (period) => {
  switch (period) {
    case '7d':
      return 0.6;
    case '30d':
      return 1.0;
    case '90d':
      return 1.7;
    default:
      return 1.0;
  }
};

const confidenceForPeriod = (period) => {
  switch (period) {
    case '7d':
      return 'High';
    case '30d':
      return 'Medium';
    case '90d':
      return 'Low';
    default:
      return 'Medium';
  }
};

const PredictedDemandTable = ({ period = '30d' }) => {
  const rows = useMemo(() => {
    const mult = periodMultiplier(period);

    return CATEGORIES.map(({ category, baseQty }) => {
      const predictedQty = Math.round(baseQty * mult);
      const confidence = confidenceForPeriod(period);
      return { category, predictedQty, confidence };
    });
  }, [period]);

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
      <h3 style={{ marginTop: 0 }}>Predicted Demand</h3>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: '8px' }}>
              Garment Category
            </th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: '8px' }}>
              Predicted Quantity
            </th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: '8px' }}>
              Confidence Level
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.category}>
              <td style={{ padding: '8px', borderBottom: '1px solid #f2f2f2' }}>{r.category}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #f2f2f2' }}>
                {r.predictedQty}
              </td>
              <td style={{ padding: '8px', borderBottom: '1px solid #f2f2f2' }}>
                {r.confidence}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PredictedDemandTable;
