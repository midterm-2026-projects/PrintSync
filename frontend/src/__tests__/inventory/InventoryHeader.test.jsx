import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import InventoryHeader from '../../features/inventory/components/InventoryHeader';

describe('InventoryHeader Component', () => {
  it('should display the correct item count', () => {
    render(<InventoryHeader itemCount={5} />);
    expect(screen.getByTestId('item-count')).toHaveTextContent('5');
  });

  it('should handle null or zero counts by displaying 0', () => {
    render(<InventoryHeader itemCount={null} />);
    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
  });
});