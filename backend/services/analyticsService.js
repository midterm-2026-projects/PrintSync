/**
 * analyticsService.js
 * Service-layer for analytics endpoints.
 *
 * This service delegates to posModel query methods (moved from analyticsModel).
 * Unit tests can mock posModel to validate service behavior/validation.
 */
import { posModel } from '../models/posModel.js';
import { generateAIBusinessInsights } from './llmClient.js';

export const VALID_PERIODS = new Set(['7d', '30d', '90d']);

export function parsePeriod(value) {
  if (!value) return null;
  if (!VALID_PERIODS.has(value)) return null;
  return value;
}

function normalizePeriod(period) {
  return parsePeriod(period) ?? '30d';
}

export function toInterval(period) {
  const normalized = normalizePeriod(period);
  if (normalized === '7d') return '7 days';
  if (normalized === '90d') return '90 days';
  return '30 days';
}

/** Return number of days for a period string. */
export function periodToDays(period) {
  const normalized = normalizePeriod(period);
  if (normalized === '7d') return 7;
  if (normalized === '90d') return 90;
  return 30;
}

export function getErrorMessage(err) {
  return err instanceof Error ? err.message : 'Unknown error';
}

export function invalidPeriodResponse(res) {
  return res.status(400).json({
    ok: false,
    error: 'Invalid period. Expected one of: 7d, 30d, 90d',
  });
}

// KPI: return { totalRevenue, totalOrders }
export async function getKpi(period = '30d') {
  const normalized = normalizePeriod(period);
  const interval = toInterval(normalized);
  const out = await posModel.queryKpiByPeriod(normalized, interval);
  // If period query returns 0, try all-time as fallback
  if (out && out.totalRevenue === 0 && out.totalOrders === 0) {
    const allTime = await posModel.queryKpiAllTime();
    console.warn(`[analyticsService] getKpi(${period}) returned 0; all-time fallback:`, allTime);
    if (allTime.totalRevenue > 0 || allTime.totalOrders > 0) {
      return allTime;
    }
  }
  return out ?? { totalRevenue: 0, totalOrders: 0 };
}

// Trend: return { data: [{ date, amount }] }
export async function getSalesTrend(period = '30d') {
  const normalized = normalizePeriod(period);
  const interval = toInterval(normalized);
  const out = await posModel.querySalesTrendByPeriod(normalized, interval);
  // If period query returns no data, try all-time as fallback
  if (out && (!out.data || out.data.length === 0)) {
    const allTime = await posModel.querySalesTrendByPeriod('all', '9999 days');
    console.warn(`[analyticsService] getSalesTrend(${period}) returned empty; all-time fallback:`, allTime);
    if (allTime.data && allTime.data.length > 0) {
      return allTime;
    }
  }
  return out ?? { data: [] };
}

// Transaction history: return { transactions: [{ id, amount, createdAt }] }
export async function getTransactionHistory(period = '30d') {
  const normalized = normalizePeriod(period);
  const interval = toInterval(normalized);
  const out = await posModel.queryTransactionsByPeriod(normalized, interval);

  const transactions = out?.transactions ?? out ?? [];
  // If period query returns empty, try all-time as fallback
  if (Array.isArray(transactions) && transactions.length === 0) {
    const allTime = await posModel.queryTransactionsByPeriod('all', '9999 days');
    const allTxn = allTime?.transactions ?? [];
    if (allTxn.length > 0) {
      console.warn(`[analyticsService] getTransactionHistory(${period}) returned empty; all-time fallback: ${allTxn.length} txns`);
      return { transactions: allTxn };
    }
  }
  // Be permissive: allow either {transactions:[...]} or [...] from mocked model.
  if (Array.isArray(transactions)) {
    return { transactions };
  }
  return { transactions: [] };
}

/**
 * Get AI-generated business insights from recent orders.
 * @param {number|string} limit - number of recent orders to include
 */
export async function getAiBusinessInsights(limit = 15) {
  if (limit === undefined || limit === null) {
    limit = 15;
  }

  const n = Number(limit);
  if (!Number.isInteger(n) || n < 1) {
    throw new TypeError('limit must be a positive integer');
  }

  const orders = await posModel.queryRecentOrdersForAi(n);

  const insightsText = await generateAIBusinessInsights(orders, { limit: n });

  return { insights: insightsText, orderCount: Array.isArray(orders) ? orders.length : 0 };
}
