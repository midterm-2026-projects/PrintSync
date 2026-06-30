import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import InventoryAdder from '../../features/inventory/components/InventoryAdder';

describe('InventoryAdder & Parser Logic', () => {
  it('should correctly map raw data to standardized fields (name to productName)', () => {
    const onAddMock = vi.fn();
    render(<InventoryAdder onAdd={onAddMock} />);
    
    fireEvent.click(screen.getByText(/Add Valid Item/i));
    
    const addedItem = onAddMock.mock.calls[0][0];
    expect(addedItem.productName).toBe('Cotton Tee');
    expect(addedItem.stock).toBe(50);
  });

  it('should handle empty/missing fields by providing default values', () => {
    const onAddMock = vi.fn();
    render(<InventoryAdder onAdd={onAddMock} />);
    
    fireEvent.click(screen.getByText(/Add Empty Item/i));
    
    const addedItem = onAddMock.mock.calls[0][0];
    // Acceptance Criteria: Check what function does when fields are empty
    expect(addedItem.productName).toBe('Unnamed Item');
    expect(addedItem.stock).toBe(0);
  });
});