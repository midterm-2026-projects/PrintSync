import { describe, it, expect } from 'vitest';
import { initializeInventory, formatInventoryItem } from '../../features/inventory/utils/inventoryLogic';

describe('Inventory Logic (Erica - Week 1 Day 1)', () => {
  it('should initialize with an empty array', () => {
    expect(initializeInventory()).toEqual([]);
  });

  it('should correctly map raw data to standardized fields', () => {
    const raw = { name: 'Silk Screen', quantity: 20 };
    const result = formatInventoryItem(raw);
    expect(result.productName).toBe('Silk Screen');
    expect(result.stock).toBe(20);
  });

  // NEW CRITERIA: Check behavior with empty fields
  it('should handle empty or missing fields by providing defaults', () => {
    const emptyInput = { name: "", quantity: "" };
    const result = formatInventoryItem(emptyInput);
    
    expect(result.productName).toBe('Unnamed Item');
    expect(result.stock).toBe(0);
  });

  it('should handle a completely null input safely', () => {
    const result = formatInventoryItem(null);
    expect(result.productName).toBe('Unknown Item');
    expect(result.stock).toBe(0);
  });
});