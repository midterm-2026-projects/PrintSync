import { describe, it, expect } from 'vitest';
import { calculateFinancials } from '../../../features/pos/services/posService';

describe('POS Service - Calculation Logic', () => {
  const mockCart = [{ price: 50, quantity: 2 }]; // Subtotal = 100

  // PR Acceptance Criteria Check
  it('should return a grand total of 112.00 when the cart subtotal is 100.00 and tax is 12%', () => {
    const result = calculateFinancials(mockCart, 12);
    expect(result.subtotal).toBe(100);
    expect(result.tax).toBe(12);
    expect(result.total).toBe(112);
  });

  it('should clamp negative tax rates to 0%', () => {
    const result = calculateFinancials(mockCart, -10);
    expect(result.safeTaxRate).toBe(0);
    expect(result.total).toBe(100);
  });

  it('should return zeros when the cart is empty', () => {
    const result = calculateFinancials([], 12);
    expect(result.total).toBe(0);
  });
});