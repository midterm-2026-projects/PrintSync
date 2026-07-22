const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.ok) {
    throw new Error(body.error || `Analytics request failed (${response.status})`);
  }
  return body;
}

/**
 * Fetch KPI (total revenue + total orders) for a given period.
 * @param {string} period - One of '7d', '30d', '90d'
 * @returns {Promise<{totalRevenue: number, totalOrders: number}>}
 */
export function getAnalyticsKpi(period = '30d') {
  return request(`/analytics/kpi?period=${encodeURIComponent(period)}`).then(({ kpi }) => kpi);
}

/**
 * Fetch sales trend data for charting over a given period.
 * @param {string} period - One of '7d', '30d', '90d'
 * @returns {Promise<{data: Array<{date: string, amount: number}>}>}
 */
export function getSalesTrend(period = '30d') {
  return request(`/analytics/sales-trend?period=${encodeURIComponent(period)}`).then(({ trend }) => trend);
}

/**
 * Fetch transaction history for a given period.
 * @param {string} period - One of '7d', '30d', '90d'
 * @returns {Promise<Array<{id: string, amount: number, createdAt: string}>>}
 */
export function getTransactionHistory(period = '30d') {
  return request(`/analytics/transaction-history?period=${encodeURIComponent(period)}`).then(({ transactions }) => transactions);
}

/**
 * Fetch AI-generated business insights.
 * @param {number} [limit=15] - Number of recent orders to analyze
 * @returns {Promise<{insights: string, orderCount: number}>}
 */
export function getAiInsights(limit = 15) {
  return request(`/analytics/ai-insights?limit=${encodeURIComponent(limit)}`).then(({ insights, orderCount }) => ({
    insights,
    orderCount,
  }));
}

