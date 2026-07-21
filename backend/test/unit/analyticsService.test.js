import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../models/posModel.js', () => {
  return {
    posModel: {
      queryKpiByPeriod: vi.fn(),
      querySalesTrendByPeriod: vi.fn(),
      queryTransactionsByPeriod: vi.fn(),
      queryRecentOrdersForAi: vi.fn(),
    },
  };
});

vi.mock('../../services/llmClient.js', () => {
  return {
    generateAIBusinessInsights: vi.fn(),
  };
});

import { posModel } from '../../models/posModel.js';
import { generateAIBusinessInsights } from '../../services/llmClient.js';
import {
  getKpi,
  getSalesTrend,
  getTransactionHistory,
  getAiBusinessInsights,
} from '../../services/analyticsService.js';

describe('analyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAiBusinessInsights', () => {
    it('should query recent orders and return insights with orderCount', async () => {
      const orders = [{ orderId: 'TXN-1', totalAmount: 100, createdAt: '2024-01-01', items: [] }];
      vi.mocked(posModel.queryRecentOrdersForAi).mockResolvedValue(orders);
      vi.mocked(generateAIBusinessInsights).mockResolvedValue('Insight text');

      const out = await getAiBusinessInsights(1);

      expect(posModel.queryRecentOrdersForAi).toHaveBeenCalledWith(1);
      expect(generateAIBusinessInsights).toHaveBeenCalledWith(orders, { limit: 1 });
      expect(out).toEqual({ insights: 'Insight text', orderCount: 1 });
    });

    it('should throw when limit is not a positive integer', async () => {
      await expect(getAiBusinessInsights(0)).rejects.toThrow('limit must be a positive integer');
      await expect(getAiBusinessInsights(-5)).rejects.toThrow('limit must be a positive integer');
    });
  });

  describe('getKpi', () => {
    it('should call queryKpiByPeriod with normalized period and return model output', async () => {
      vi.mocked(posModel.queryKpiByPeriod).mockResolvedValue({
        totalRevenue: 10,
        totalOrders: 2,
      });

      const out = await getKpi('7d');

      expect(posModel.queryKpiByPeriod).toHaveBeenCalledWith('7d', '7 days');
      expect(out).toEqual({ totalRevenue: 10, totalOrders: 2 });
    });

    it('should default to 30d when model returns nullish', async () => {
      vi.mocked(posModel.queryKpiByPeriod).mockResolvedValue(null);

      const out = await getKpi('nope');

      expect(posModel.queryKpiByPeriod).toHaveBeenCalledWith('30d', '30 days');
      expect(out).toEqual({ totalRevenue: 0, totalOrders: 0 });
    });

    it('should default to 30d when period is invalid/missing', async () => {
      vi.mocked(posModel.queryKpiByPeriod).mockResolvedValue({
        totalRevenue: 5,
        totalOrders: 1,
      });

      const out = await getKpi(undefined);

      expect(posModel.queryKpiByPeriod).toHaveBeenCalledWith('30d', '30 days');
      expect(out).toEqual({ totalRevenue: 5, totalOrders: 1 });
    });

    it('should propagate model errors (service should not swallow)', async () => {
      vi.mocked(posModel.queryKpiByPeriod).mockRejectedValue(
        new Error('DB failed')
      );

      await expect(getKpi('7d')).rejects.toThrow('DB failed');
      expect(posModel.queryKpiByPeriod).toHaveBeenCalledWith('7d', '7 days');
    });

    it('should return model output as-is when KPI model output has wrong shape', async () => {
      vi.mocked(posModel.queryKpiByPeriod).mockResolvedValue(123);

      const out = await getKpi('7d');
      expect(out).toBe(123);
    });
  });

  describe('getSalesTrend', () => {
    it('should return {data} from model output', async () => {
      vi.mocked(posModel.querySalesTrendByPeriod).mockResolvedValue({
        data: [{ date: '2020-01-01', amount: 100 }],
      });

      const out = await getSalesTrend('30d');

      expect(posModel.querySalesTrendByPeriod).toHaveBeenCalledWith(
        '30d',
        '30 days'
      );
      expect(out).toEqual({ data: [{ date: '2020-01-01', amount: 100 }] });
    });

    it('should return empty data array when model returns nullish', async () => {
      vi.mocked(posModel.querySalesTrendByPeriod).mockResolvedValue(undefined);

      const out = await getSalesTrend('bad');

      expect(posModel.querySalesTrendByPeriod).toHaveBeenCalledWith(
        '30d',
        '30 days'
      );
      expect(out).toEqual({ data: [] });
    });

    it('should default to 30d when period is invalid/missing', async () => {
      vi.mocked(posModel.querySalesTrendByPeriod).mockResolvedValue({
        data: [{ date: '2020-01-01', amount: 50 }],
      });

      const out = await getSalesTrend('');

      expect(posModel.querySalesTrendByPeriod).toHaveBeenCalledWith(
        '30d',
        '30 days'
      );
      expect(out).toEqual({ data: [{ date: '2020-01-01', amount: 50 }] });
    });

    it('should propagate model errors (service should not swallow)', async () => {
      vi.mocked(posModel.querySalesTrendByPeriod).mockRejectedValue(
        new Error('Query blew up')
      );

      await expect(getSalesTrend('7d')).rejects.toThrow('Query blew up');
      expect(posModel.querySalesTrendByPeriod).toHaveBeenCalledWith('7d', '7 days');
    });

    it('should return model output as-is when trend model output has wrong shape', async () => {
      vi.mocked(posModel.querySalesTrendByPeriod).mockResolvedValue('nope');

      const out = await getSalesTrend('7d');
      expect(out).toBe('nope');
    });
  });

  describe('getTransactionHistory', () => {
    it('should return {transactions} from model output wrapper', async () => {
      vi.mocked(posModel.queryTransactionsByPeriod).mockResolvedValue({
        transactions: [{ id: 'o1', amount: 10, createdAt: '2020-01-01' }],
      });

      const out = await getTransactionHistory('90d');

      expect(posModel.queryTransactionsByPeriod).toHaveBeenCalledWith('90d', '90 days');
      expect(out).toEqual({
        transactions: [{ id: 'o1', amount: 10, createdAt: '2020-01-01' }],
      });
    });

    it('should support model returning a raw array of transactions', async () => {
      vi.mocked(posModel.queryTransactionsByPeriod).mockResolvedValue([
        { id: 'o1', amount: 10, createdAt: '2020-01-01' },
      ]);

      const out = await getTransactionHistory('7d');

      expect(posModel.queryTransactionsByPeriod).toHaveBeenCalledWith('7d', '7 days');
      expect(out).toEqual({
        transactions: [{ id: 'o1', amount: 10, createdAt: '2020-01-01' }],
      });
    });

    it('should return empty transactions when model returns nullish', async () => {
      vi.mocked(posModel.queryTransactionsByPeriod).mockResolvedValue(null);

      const out = await getTransactionHistory('invalid');

      expect(posModel.queryTransactionsByPeriod).toHaveBeenCalledWith('30d', '30 days');
      expect(out).toEqual({ transactions: [] });
    });

    it('should normalize missing transactions field to empty array', async () => {
      vi.mocked(posModel.queryTransactionsByPeriod).mockResolvedValue({});

      const out = await getTransactionHistory('30d');

      expect(posModel.queryTransactionsByPeriod).toHaveBeenCalledWith('30d', '30 days');
      expect(out).toEqual({ transactions: [] });
    });

    it('should default to 30d when period is invalid/missing', async () => {
      vi.mocked(posModel.queryTransactionsByPeriod).mockResolvedValue({
        transactions: [{ id: 'o2', amount: 20, createdAt: '2020-01-02' }],
      });

      const out = await getTransactionHistory(null);

      expect(posModel.queryTransactionsByPeriod).toHaveBeenCalledWith('30d', '30 days');
      expect(out).toEqual({
        transactions: [{ id: 'o2', amount: 20, createdAt: '2020-01-02' }],
      });
    });

    it('should propagate model errors (service should not swallow)', async () => {
      vi.mocked(posModel.queryTransactionsByPeriod).mockRejectedValue(
        new Error('Model fail')
      );

      await expect(getTransactionHistory('7d')).rejects.toThrow('Model fail');
      expect(posModel.queryTransactionsByPeriod).toHaveBeenCalledWith('7d', '7 days');
    });

    it('should default to empty array when model output has wrong shape', async () => {
      vi.mocked(posModel.queryTransactionsByPeriod).mockResolvedValue({ transactions: null });

      const out = await getTransactionHistory('7d');
      expect(out).toEqual({ transactions: [] });
    });
  });

});

