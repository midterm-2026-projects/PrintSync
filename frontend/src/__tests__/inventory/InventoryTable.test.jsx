import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import InventoryTable from '../../features/inventory/components/InventoryTable';

describe('InventoryTable Component', () => {
  it('should show initialization message when items list is null or empty', () => {
    render(<InventoryTable items={null} />);
    expect(screen.getByText(/inventory is currently empty/i)).toBeInTheDocument();
  });

  it('should correctly render provided inventory items', () => {
    const mockItems = [{ id: '1', productName: 'Ink', stock: 10, category: 'Material' }];
    render(<InventoryTable items={mockItems} />);
    expect(screen.getByText('Ink')).toBeInTheDocument();
    expect(screen.getByText('10 units')).toBeInTheDocument();
  });
});