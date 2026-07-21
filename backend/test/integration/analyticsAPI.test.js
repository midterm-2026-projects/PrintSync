import { describe, it, expect, afterEach, vi } from 'vitest';

import request from 'supertest';

import app from '../../app.js';
import * as analyticsService from '../../services/analyticsService.js';

vi.mock('../../services/analyticsService.js', () => ({
  parsePeriod: vi.fn((value) => {
    if (!value) return null;
    if (['7d', '30d', '90d'].includes(value)) return value;
    return null;
  }),

  getKpi: vi.fn(),
  getSalesTrend: vi.fn(),
  getTransactionHistory: vi.fn(),
  getAiBusinessInsights: vi.fn(),

  // Used by controllers via destructuring
  getErrorMessage: vi.fn((err) => (err instanceof Error ? err.message : 'Unknown error')),
  invalidPeriodResponse: vi.fn((res) =>
    res.status(400).json({
      ok: false,
      error: 'Invalid period. Expected one of: 7d, 30d, 90d',
    })
  ),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('analytics API (routes → controllers → mocked service layer)', () => {
  describe('GET /analytics/kpi', () => {
    it('returns 400 for invalid period', async () => {
      const res = await request(app).get('/analytics/kpi').query({ period: 'bad' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual(
        expect.objectContaining({ ok: false, error: expect.stringContaining('Invalid period') })
      );

      expect(analyticsService.parsePeriod).toHaveBeenCalledWith('bad');
      expect(analyticsService.getKpi).not.toHaveBeenCalled();
    });

    it('returns ok=true with KPI payload for valid period', async () => {
      const mockKpi = { totalRevenue: 999, totalOrders: 12 };
      vi.mocked(analyticsService.getKpi).mockResolvedValue(mockKpi);

      const res = await request(app).get('/analytics/kpi').query({ period: '30d' });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.kpi).toEqual(mockKpi);

      expect(analyticsService.parsePeriod).toHaveBeenCalledWith('30d');
      expect(analyticsService.getKpi).toHaveBeenCalledWith('30d');
    });
  });

  describe('GET /analytics/sales-trend', () => {
    it('returns ok=true with trend data for valid period', async () => {
      const mockTrend = { data: [{ date: '2024-01-01', amount: 100 }, { date: '2024-01-02', amount: 250 }] };
      vi.mocked(analyticsService.getSalesTrend).mockResolvedValue(mockTrend);

      const res = await request(app).get('/analytics/sales-trend').query({ period: '7d' });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.trend).toEqual(mockTrend);

      expect(analyticsService.parsePeriod).toHaveBeenCalledWith('7d');
      expect(analyticsService.getSalesTrend).toHaveBeenCalledWith('7d');
    });
  });

  describe('GET /analytics/transaction-history', () => {
    it('returns ok=true with transactions for valid period', async () => {
      const mockTxns = {
        transactions: [
          { id: 'TXN-A', amount: 100, createdAt: '2024-01-01T00:00:00.000Z' },
          { id: 'TXN-B', amount: 250, createdAt: '2024-01-02T00:00:00.000Z' },
        ],
      };

      vi.mocked(analyticsService.getTransactionHistory).mockResolvedValue(mockTxns);

      const res = await request(app).get('/analytics/transaction-history').query({ period: '30d' });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);

      expect(res.body.transactions).toEqual(mockTxns.transactions);
      expect(res.body.count).toBe(2);

      expect(analyticsService.parsePeriod).toHaveBeenCalledWith('30d');
      expect(analyticsService.getTransactionHistory).toHaveBeenCalledWith('30d');
    });
  });

  describe('GET /analytics/ai-insights', () => {
    it('returns ok=true with generated insights for valid limit', async () => {
      vi.mocked(analyticsService.getAiBusinessInsights).mockResolvedValue({
        insights: 'Sales are trending upward.',
        orderCount: 15,
      });

      const res = await request(app).get('/analytics/ai-insights').query({ limit: '15' });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.insights).toBe('Sales are trending upward.');
      expect(res.body.orderCount).toBe(15);
      expect(analyticsService.getAiBusinessInsights).toHaveBeenCalledWith(15);
    });

    it('returns 400 for invalid limit', async () => {
      const res = await request(app).get('/analytics/ai-insights').query({ limit: 'bad' });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toContain('Invalid limit');
    });
  });
});
