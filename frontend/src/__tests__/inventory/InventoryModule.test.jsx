import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InventoryModule from '../../features/inventory/components/InventoryModule';

describe('InventoryModule Interaction', () => {
  it('should add a new row to the table when "Add Valid Item" is clicked', () => {
    render(<InventoryModule />);
    
    const addButton = screen.getByText(/Add Valid Item/i);
    fireEvent.click(addButton);

    // Check if the formatted item appears in the table
    expect(screen.getByText('Silk Screen Mesh')).toBeInTheDocument();
    expect(screen.getByText('15 units')).toBeInTheDocument();
  });

  it('should add a default "Unnamed Item" when "Add Item with Empty Fields" is clicked', () => {
    render(<InventoryModule />);
    
    const emptyButton = screen.getByText(/Add Item with Empty Fields/i);
    fireEvent.click(emptyButton);

    // Verify the logic for empty fields is reflected in the UI
    expect(screen.getByText('Unnamed Item')).toBeInTheDocument();
    expect(screen.getByText('0 units')).toBeInTheDocument();
  });

  it('should clear the table when "Reset" is clicked', () => {
    render(<InventoryModule />);
    
    // Add an item first
    fireEvent.click(screen.getByText(/Add Valid Item/i));
    
    // Click reset
    fireEvent.click(screen.getByText(/Reset/i));

    // Verify the empty state message returns
    expect(screen.getByText(/inventory is currently empty/i)).toBeInTheDocument();
  });
});