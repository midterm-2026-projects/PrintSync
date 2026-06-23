import { describe, it, expect } from 'vitest';
import { initializeInventory, formatInventoryItem } from './inventoryLogic';

describe('Inventory Management - Week 1 Day 1', () => {

  // It should return an empty array or valid initialized state structure when the initialization function is executed.

  describe('initialization logic', () => {
    it('should return an empty array or valid initialized state structure', () => {
      const initialState = initializeInventory();
      expect(Array.isArray(initialState)).toBe(true);
      expect(initialState.length).toBe(0);
    });
  });

  // It should properly extract and return the correct product name and stock quantity variables passed into the formatting function.

  describe('data parser utility', () => {
    it('should properly extract and return the correct product name and stock quantity', () => {
      const rawInput = { 
        name: 'Cotton T-Shirt', 
        quantity: 50, 
        type: 'Garment',
        irrelevantField: 'ignore me'
      };

      const formatted = formatInventoryItem(rawInput);

      expect(formatted.productName).toBe('Cotton T-Shirt');
      expect(formatted.stock).toBe(50);
    });

    it('should handle edge cases with default values', () => {
        const incompleteInput = { name: 'Mystery Item' };
        const formatted = formatInventoryItem(incompleteInput);
        
        expect(formatted.stock).toBe(0);
    });
  });
});