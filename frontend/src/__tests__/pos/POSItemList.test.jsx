import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import POSItemList from '../../features/pos/components/POSItemList';

describe('POSItemList Component', () => {
  it('should display a message when no items are available', () => {
    render(<POSItemList items={[]} />);
    expect(screen.getByText(/No matching items found/i)).toBeInTheDocument();
  });

  it('should render items and an "Add to Cart" button', () => {
    const mockItems = [{ id: 1, productName: 'Jersey', stock: 10 }];
    render(<POSItemList items={mockItems} />);
    expect(screen.getByText('Jersey')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add to Cart/i })).toBeInTheDocument();
  });
});
