import { useMemo } from 'react';

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

const daysForPeriod = (period) => {
  switch (period) {
    case '7d':
      return 7;
    case '30d':
      return 30;
    case '90d':
      return 90;
    default:
      return 30;
  }
};

const formatDate = (date) => {
  // MMM dd, yyyy (e.g., Jan 05, 2026)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
};

const addDaysInclusiveEnd = (startDate, days) => {
  // inclusive: start=today, end=today + (days-1)
  const end = new Date(startDate);
  end.setDate(end.getDate() + (days - 1));
  return end;
};

const PredictedDemandTable = ({ period = '30d' }) => {
  const days = daysForPeriod(period);

  const rows = useMemo(() => {
    const mult = periodMultiplier(period);

    return CATEGORIES.map(({ category, baseQty }) => {
      const predictedQty = Math.round(baseQty * mult);
      const confidence = confidenceForPeriod(period);
      return { category, predictedQty, confidence };
    });
  }, [period]);

  const dateRangeLine = useMemo(() => {
    const today = new Date();
    const end = addDaysInclusiveEnd(today, days);
    const startStr = formatDate(today);
    const endStr = formatDate(end);
    return `Predicted for next ${days} days (${startStr}\u2013${endStr})`;
  }, [days]);

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
      <h3 style={{ marginTop: 0 }}>Predicted Demand</h3>
      <div style={{ marginBottom: '10px' }}>{dateRangeLine}</div>

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
