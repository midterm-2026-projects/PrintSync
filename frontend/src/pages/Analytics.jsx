import React, { useEffect, useState, useCallback } from 'react';

import AnalyticsHeader from '../features/analytics/components/AnalyticsHeader';
import ForecastPeriodSelector from '../features/analytics/components/ForecastPeriodSelector';
import KPIDisplay from '../features/analytics/components/KPIDisplay';
import SalesTrendChart from '../features/analytics/components/SalesTrendChart';
import TransactionHistory from '../features/analytics/components/TransactionHistory';
import AIInsightArea from '../features/analytics/components/AIInsightArea';
import PredictedDemandTable from '../features/analytics/components/PredictedDemandTable';

import {
  getAnalyticsKpi,
  getSalesTrend,
  getTransactionHistory,
  getAiInsights,
} from '../features/analytics/services/analyticsApi';

export default function Analytics() {
  const [period, setPeriod] = useState('30d');
  const [kpi, setKpi] = useState({ totalRevenue: 0, totalOrders: 0 });
  const [trend, setTrend] = useState({ data: [] });
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  // Load analytics data from backend
  const loadAnalytics = useCallback(async (selectedPeriod) => {
    setError('');
    try {
      const [kpiData, trendData, txnData] = await Promise.all([
        getAnalyticsKpi(selectedPeriod).catch((err) => {
          console.warn('KPI fetch failed:', err.message);
          return { totalRevenue: 0, totalOrders: 0 };
        }),
        getSalesTrend(selectedPeriod).catch((err) => {
          console.warn('Sales trend fetch failed:', err.message);
          return { data: [] };
        }),
        getTransactionHistory(selectedPeriod).catch((err) => {
          console.warn('Transaction history fetch failed:', err.message);
          return [];
        }),
      ]);
      setKpi(kpiData);
      setTrend(trendData);
      setTransactions(txnData || []);

      // Debug: log what we got from the API
      console.debug('Analytics API results:', { kpiData, trendData, txnCount: (txnData || []).length });
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadAnalytics(period);
  }, [period, loadAnalytics]);

  // Map trend data for SalesTrendChart component
  const chartData = trend?.data?.length > 0 ? trend.data : [];

  const handleAnalyzeInsights = useCallback(async () => {
    const result = await getAiInsights(15);
    return result.insights;
  }, []);

  return (
    <div>
      <AnalyticsHeader lastUpdated={new Date().toISOString().split('T')[0]} />

      {error && <p role="alert" style={{ color: 'red' }}>{error}</p>}

      <ForecastPeriodSelector value={period} onChange={setPeriod} />

      <KPIDisplay transactions={transactions} totalRevenue={kpi.totalRevenue} totalOrders={kpi.totalOrders} />

      <SalesTrendChart data={chartData} />

      <TransactionHistory transactions={transactions} />

      <PredictedDemandTable period={period} />

      <AIInsightArea onFetchInsights={handleAnalyzeInsights} />
    </div>
  );
}

