/**
 * analyticsService.js
 * Service-layer for analytics endpoints.
 *
 * For now, this service delegates to analyticsModel query methods.
 * Unit tests can mock analyticsModel to validate service behavior/validation.
 */
import { analyticsModel } from '../models/analyticsModel.js';

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
  const out = await analyticsModel.queryKpiByPeriod(normalized, interval);
  // Expect model to return { totalRevenue, totalOrders }
  return out ?? { totalRevenue: 0, totalOrders: 0 };
}

// Trend: return { data: [{ date, amount }] }
export async function getSalesTrend(period = '30d') {
  const normalized = normalizePeriod(period);
  const interval = toInterval(normalized);
  const out = await analyticsModel.querySalesTrendByPeriod(normalized, interval);
  return out ?? { data: [] };
}

// Transaction history: return { transactions: [{ id, amount, createdAt }] }
export async function getTransactionHistory(period = '30d') {
  const normalized = normalizePeriod(period);
  const interval = toInterval(normalized);
  const out = await analyticsModel.queryTransactionsByPeriod(normalized, interval);

  const transactions = out?.transactions ?? out ?? [];
  // Be permissive: allow either {transactions:[...]} or [...] from mocked model.
  if (Array.isArray(transactions)) {
    return { transactions };
  }
  return { transactions: [] };
}
