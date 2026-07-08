import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../models/salesModel.js', () => {
  return {
    salesPOSModel: {
      createOrder: vi.fn(),
      createOrderItems: vi.fn(),
      getOrderById: vi.fn(),
    },
    salesAnalyticsModel: {
      queryOrdersByDate: vi.fn(),
      buildAiReadySalesDataPayload: vi.fn(),
    },
  };
});

vi.mock('../../utils/generateTransactionId.js', () => ({
  default: vi.fn(() => 'TXN-20231027-MOCK01'),
}));

import {
  validateOrderItems,
  calculateTotal,
  buildOrderItems,
  processTransaction,
  aggregateSalesByDate,
  aggregateSalesByDateFromDb,
  formatAiReadySalesData,
} from '../../services/salesService.js';

import { salesPOSModel, salesAnalyticsModel } from '../../models/salesModel.js';

describe('Sales Service - POS Logic', () => {
  const mockItems = [
    { productId: '1', productName: 'Cotton T-Shirt', quantity: 2, unitPrice: 350 },
    { productId: '2', productName: 'Vinyl Sticker', quantity: 3, unitPrice: 50 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null for valid items', () => {
    expect(validateOrderItems(mockItems)).toBeNull();
  });

  it('should return an error if items array is empty', () => {
    expect(validateOrderItems([])).toBe('Order must contain at least one item.');
  });

  it('should return an error if an item is missing productId', () => {
    const bad = [{ productName: 'Test', quantity: 1, unitPrice: 100 }];
    expect(validateOrderItems(bad)).toBe('Each item must have a productId and productName.');
  });

  it('should correctly calculate the grand total (350*2 + 50*3 = 850)', () => {
    expect(calculateTotal(mockItems)).toBe(850);
  });

  it('should map items into correct schema and preserve unit_price snapshots', () => {
    const result = buildOrderItems('TXN-001', mockItems);
    expect(result[0]).toMatchObject({
      order_id: 'TXN-001',
      unit_price: 350,
      subtotal: 700,
    });
  });

  describe('processTransaction', () => {
    beforeEach(() => {
      salesPOSModel.createOrder.mockResolvedValue({
        order_id: 'TXN-20231027-MOCK01',
        total_amount: 850,
        created_at: '2023-10-27T10:00:00.000Z',
      });
    });

    it('should return orderId and totalAmount on success', async () => {
      const result = await processTransaction(mockItems);
      expect(result.orderId).toBe('TXN-20231027-MOCK01');
      expect(result.totalAmount).toBe(850);
    });

    it('should fail and not call createOrder if validation fails', async () => {
      await expect(processTransaction([])).rejects.toThrow('Order must contain at least one item.');
      expect(salesPOSModel.createOrder).not.toHaveBeenCalled();
    });
  });
});

describe('Sales Service - Analytics Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('aggregateSalesByDate', () => {
    it('sums totals for orders matching the target local calendar day', () => {
      const orders = [
        { createdAt: '2026-07-01T09:00:00', total: 100 },
        { createdAt: '2026-07-01T13:15:00', total: '50' },
        { createdAt: '2026-07-02T01:00:00', total: 999 },
      ];
      const total = aggregateSalesByDate(orders, '2026-07-01T00:00:00');
      expect(total).toBe(150);
    });

    it('returns 0 when orders array is empty (still validates targetDate)', () => {
      const total = aggregateSalesByDate([], '2026-07-01T00:00:00');
      expect(total).toBe(0);
    });

    it('throws on invalid targetDate', () => {
      expect(() => aggregateSalesByDate([], 'not-a-date')).toThrow(TypeError);
    });

    it('throws on invalid orders input type', () => {
      expect(() => aggregateSalesByDate(null, '2026-07-01T00:00:00')).toThrow(TypeError);
    });

    it('works with Date instances', () => {
      const orders = [
        { createdAt: new Date('2026-07-01T10:00:00'), total: 10 },
        { createdAt: new Date('2026-07-01T11:00:00'), total: 5 },
      ];
      const total = aggregateSalesByDate(orders, new Date('2026-07-01T00:00:00'));
      expect(total).toBe(15);
    });
  });

  describe('aggregateSalesByDateFromDb', () => {
    it('calls the model and sums the returned rows', () => {
      salesAnalyticsModel.queryOrdersByDate.mockReturnValue([
        { createdAt: '2026-07-01T09:00:00', total: 100 },
        { createdAt: '2026-07-01T13:15:00', total: 50 },
      ]);

      const total = aggregateSalesByDateFromDb('2026-07-01T00:00:00');
      expect(total).toBe(150);
      expect(salesAnalyticsModel.queryOrdersByDate).toHaveBeenCalledTimes(1);
    });

    it('returns 0 when model returns empty array', () => {
      salesAnalyticsModel.queryOrdersByDate.mockReturnValue([]);

      const total = aggregateSalesByDateFromDb('2026-07-01T00:00:00');
      expect(total).toBe(0);
      expect(salesAnalyticsModel.queryOrdersByDate).toHaveBeenCalledTimes(1);
    });

    it('throws when model returns non-array', () => {
      salesAnalyticsModel.queryOrdersByDate.mockReturnValue(null);

      expect(() => aggregateSalesByDateFromDb('2026-07-01T00:00:00')).toThrow(TypeError);
      expect(salesAnalyticsModel.queryOrdersByDate).toHaveBeenCalledTimes(1);
    });
  });

  describe('formatAiReadySalesData (AI Integration)', () => {
    it('returns a flat Gemini-compatible JSON object (model is mocked)', () => {
      salesAnalyticsModel.buildAiReadySalesDataPayload.mockReturnValue({
        date: '2026-07-01',
        totalSales: 150,
      });

      const out = formatAiReadySalesData({ date: '2026-07-01', totalSales: 150 });

      expect(out).toEqual({ date: '2026-07-01', totalSales: 150 });
      expect(salesAnalyticsModel.buildAiReadySalesDataPayload).toHaveBeenCalledTimes(1);
    });

    it('throws when date is missing (and does not call the model)', () => {
      expect(() => formatAiReadySalesData({ totalSales: 10 })).toThrow(TypeError);
      expect(salesAnalyticsModel.buildAiReadySalesDataPayload).not.toHaveBeenCalled();
    });

    it('throws when totalSales is not a finite number (and does not call the model)', () => {
      expect(() => formatAiReadySalesData({ date: '2026-07-01', totalSales: NaN })).toThrow(
        TypeError
      );
      expect(salesAnalyticsModel.buildAiReadySalesDataPayload).not.toHaveBeenCalled();
    });

    it('throws when input is missing (and does not call the model)', () => {
      expect(() => formatAiReadySalesData(null)).toThrow(TypeError);
      expect(salesAnalyticsModel.buildAiReadySalesDataPayload).not.toHaveBeenCalled();
    });

    it('throws when input is not an object', () => {
      expect(() => formatAiReadySalesData(123)).toThrow(TypeError);
      expect(salesAnalyticsModel.buildAiReadySalesDataPayload).not.toHaveBeenCalled();
    });
  });
});
