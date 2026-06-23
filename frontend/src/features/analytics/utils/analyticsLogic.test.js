import { describe, it, expect } from 'vitest';
import { calculateTotalRevenue, formatCurrency } from './analyticsLogic';

const mockTransactions = [
  { id: 1, amount: 500.50 },
  { id: 2, amount: 250.00 },
  { id: 3, amount: 499.50 }
];

describe('Analytics Framework - Week 1 Day 1', () => {

  // It should process a mock history array and return mathematically accurate metric summaries without modifying the state.
  
  it('should calculate mathematically accurate total revenue', () => {
    const total = calculateTotalRevenue(mockTransactions);
    expect(total).toBe(1250.00);
  });

  it('should not modify the original transaction state', () => {
    const original = [...mockTransactions];
    calculateTotalRevenue(mockTransactions);
    expect(mockTransactions).toEqual(original);
  });

  // It should parse and format computed numbers into a standardized currency string with a prefix symbol and two decimal places (e.g., ₱1,250.00).

  it('should format numbers into localized currency strings (₱)', () => {
    const formatted = formatCurrency(1250);
    expect(formatted).toBe('₱1,250.00');
  });

  it('should always show two decimal places for currency', () => {
    expect(formatCurrency(50)).toBe('₱50.00');
  });
});
