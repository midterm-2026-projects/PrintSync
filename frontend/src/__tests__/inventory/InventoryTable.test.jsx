import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InventoryTable from '../../features/inventory/components/InventoryTable';

describe('InventoryTable Component', () => {
  it('should display empty state message when no items are provided', () => {
    render(<InventoryTable items={[]} />);
    expect(screen.getByText(/inventory is currently empty/i)).toBeInTheDocument();
  });

  it('should render a list of items in the table', () => {
    const mockItems = [
      { id: 1, productName: 'Test Item', stock: 10, category: 'G' }
    ];
    render(<InventoryTable items={mockItems} />);
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('10 units')).toBeInTheDocument();
  });
});