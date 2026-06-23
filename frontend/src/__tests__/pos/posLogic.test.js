import { describe, it, expect } from 'vitest';
import { initializePOS, validateAndRetrieveItem } from '../../features/pos/utils/posLogic';

describe('POS Logic (Lyell - Week 1 Day 1)', () => {
  it('should instantiate an empty cart and zeroed totals', () => {
    const state = initializePOS();
    expect(state.cart).toEqual([]);
    expect(state.total).toBe(0);
  });

  it('should filter items correctly based on a query', () => {
    const mockInventory = [
      { id: 1, productName: 'Cotton Shirt' },
      { id: 2, productName: 'Vinyl Sticker' }
    ];
    const results = validateAndRetrieveItem(mockInventory, 'shirt');
    expect(results.length).toBe(1);
    expect(results[0].productName).toBe('Cotton Shirt');
  });

  it('should handle empty search queries by returning all items', () => {
    const mockInventory = [{ id: 1, productName: 'A' }];
    expect(validateAndRetrieveItem(mockInventory, "")).toHaveLength(1);
  });

  it('should safely return empty array if inventory is null', () => {
    expect(validateAndRetrieveItem(null, "shirt")).toEqual([]);
  });
});