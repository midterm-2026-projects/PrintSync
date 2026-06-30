import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import POSCart, { INITIAL_POS_STATE } from '../../features/pos/components/POSCart';

describe('POSCart Component & Initialization Logic', () => {
  it('should have a valid initial state structure', () => {
    expect(INITIAL_POS_STATE.cart).toEqual([]);
    expect(INITIAL_POS_STATE.total).toBe(0);
  });

  it('should handle null or undefined cartItems by showing 0', () => {
    render(<POSCart cartItems={null} />);
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
  });
});