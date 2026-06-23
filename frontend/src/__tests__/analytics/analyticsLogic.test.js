import { describe, it, expect } from 'vitest';
import { calculateTotalRevenue, formatCurrency } from '../../features/analytics/utils/analyticsLogic';

describe('Analytics Logic (Roi - Week 1 Day 1)', () => {
  
  it('should return 0 revenue for an empty or null transaction list', () => {
    expect(calculateTotalRevenue([])).toBe(0);
    expect(calculateTotalRevenue(null)).toBe(0);
  });

  it('should handle transactions with missing amount fields', () => {
    const mixedData = [{ id: 1, amount: 100 }, { id: 2 }]; // No amount on second item
    expect(calculateTotalRevenue(mixedData)).toBe(100);
  });

  it('should format numbers correctly to ₱0.00 format', () => {
    expect(formatCurrency(1250)).toBe('₱1,250.00');
    expect(formatCurrency(0)).toBe('₱0.00');
    expect(formatCurrency(null)).toBe('₱0.00');
  });
});