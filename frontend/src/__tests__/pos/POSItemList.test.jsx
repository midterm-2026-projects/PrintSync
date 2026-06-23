import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import POSItemList from '../../features/pos/components/POSItemList';

describe('POSItemList & Filtering Logic', () => {
  const mockInv = [{ id: 1, productName: 'Cotton Tee', stock: 5 }];

  it('should handle null inventory safely by returning empty state', () => {
    render(<POSItemList inventory={null} searchQuery="" />);
    expect(screen.getByText(/No matching items found/i)).toBeInTheDocument();
  });

  it('should correctly filter items based on the search query', () => {
    render(<POSItemList inventory={mockInv} searchQuery="cotton" />);
    expect(screen.getByText('Cotton Tee')).toBeInTheDocument();
  });

  it('should return no items if the search query does not match', () => {
    render(<POSItemList inventory={mockInv} searchQuery="Vinyl" />);
    expect(screen.getByText(/No matching items found/i)).toBeInTheDocument();
  });
});