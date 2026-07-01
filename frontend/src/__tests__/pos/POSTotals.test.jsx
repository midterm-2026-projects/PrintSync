import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import POSTotals from '../../features/pos/components/POSTotals';

describe('POSTotals UI Component', () => {
  const mockCart = [{ id: 1, productName: 'Test', quantity: 2, price: 50 }];

  it('should render calculated values in the correct data-testid spans', () => {
    render(<POSTotals cartItems={mockCart} />);
    
    // Check if UI reflects the 100 -> 112 calculation
    expect(screen.getByTestId('subtotal-val')).toHaveTextContent('₱100.00');
    expect(screen.getByTestId('total-val')).toHaveTextContent('₱112.00');
  });

  it('should update the UI when the tax input is edited', () => {
    render(<POSTotals cartItems={mockCart} />);
    const input = screen.getByLabelText(/Tax Percentage/i);
    
    fireEvent.change(input, { target: { value: '0' } });

    // With 0% tax, total should match subtotal
    expect(screen.getByTestId('total-val')).toHaveTextContent('₱100.00');
  });
});