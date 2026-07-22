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
  // Expect model to return { totalRevenue, totalOrders }
  return out ?? { totalRevenue: 0, totalOrders: 0 };
}

// Trend: return { data: [{ date, amount }] }
export async function getSalesTrend(period = '30d') {
  const normalized = normalizePeriod(period);
  const interval = toInterval(normalized);
  const out = await posModel.querySalesTrendByPeriod(normalized, interval);
  return out ?? { data: [] };
}

// Transaction history: return { transactions: [{ id, amount, createdAt }] }
export async function getTransactionHistory(period = '30d') {
  const normalized = normalizePeriod(period);
  const interval = toInterval(normalized);
  const out = await posModel.queryTransactionsByPeriod(normalized, interval);

  const transactions = out?.transactions ?? out ?? [];
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
