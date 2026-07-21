import React, { useState } from 'react';

import AnalyticsHeader from '../features/analytics/components/AnalyticsHeader';
import ForecastPeriodSelector from '../features/analytics/components/ForecastPeriodSelector';
import KPIDisplay from '../features/analytics/components/KPIDisplay';
import SalesTrendChart from '../features/analytics/components/SalesTrendChart';
import TransactionHistory from '../features/analytics/components/TransactionHistory';
import AIInsightArea from '../features/analytics/components/AIInsightArea';
import PredictedDemandTable from '../features/analytics/components/PredictedDemandTable';

const SAMPLE_TRANSACTIONS = [
  { id: 'TXN-001', amount: 1500 },
  { id: 'TXN-002', amount: 3000 },
  { id: 'TXN-003', amount: 1200 },
];

const SAMPLE_CHART_DATA = [
  { date: '2023-10-25', amount: 1500 },
  { date: '2023-10-26', amount: 3000 },
  { date: '2023-10-27', amount: 1200 },
];

export default function Analytics() {
  const [period, setPeriod] = useState('30d');

  return (
    <div>
      <AnalyticsHeader lastUpdated="2023-10-27" />

      <ForecastPeriodSelector value={period} onChange={setPeriod} />

      <KPIDisplay transactions={SAMPLE_TRANSACTIONS} />

      <SalesTrendChart data={SAMPLE_CHART_DATA} />

      <TransactionHistory transactions={SAMPLE_TRANSACTIONS} />

      <PredictedDemandTable period={period} />

      <AIInsightArea />
    </div>
  );
}

