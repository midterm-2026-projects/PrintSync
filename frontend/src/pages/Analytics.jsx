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
          return null;
        }),
        getSalesTrend(selectedPeriod).catch((err) => {
          console.warn('Sales trend fetch failed:', err.message);
          return null;
        }),
        getTransactionHistory(selectedPeriod).catch((err) => {
          console.warn('Transaction history fetch failed:', err.message);
          return null;
        }),
      ]);

      // Fallback: if KPI API returns 0 but transaction data has values,
      // calculate revenue from transactions
      let resolvedKpi = kpiData;
      let resolvedTxn = txnData || [];
      let resolvedTrend = trendData;

      if (!resolvedKpi || (resolvedKpi.totalRevenue === 0 && resolvedKpi.totalOrders === 0)) {
        if (Array.isArray(resolvedTxn) && resolvedTxn.length > 0) {
          // Calculate KPI from transaction history as fallback
          const txnRevenue = resolvedTxn.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
          resolvedKpi = { totalRevenue: txnRevenue, totalOrders: resolvedTxn.length };
          console.warn(`Analytics: KPI fallback from transactions — revenue=${txnRevenue}, orders=${resolvedTxn.length}`);
        } else if (resolvedKpi) {
          resolvedKpi = { totalRevenue: 0, totalOrders: 0 };
        }
      }

      if (!resolvedTrend) {
        resolvedTrend = { data: [] };
      }
      if (!resolvedTxn) {
        resolvedTxn = [];
      }

      setKpi(resolvedKpi);
      setTrend(resolvedTrend);
      setTransactions(resolvedTxn);

      // Debug: log what we got from the API
      console.debug('Analytics API results:', { kpiData: resolvedKpi, trendData: resolvedTrend, txnCount: resolvedTxn.length });
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

