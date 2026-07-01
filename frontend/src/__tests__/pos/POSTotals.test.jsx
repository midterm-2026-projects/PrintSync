import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import POSTotals from '../../features/pos/components/POSTotals';

describe('POSTotals Editable Tax Logic (Week 2 Day 2 Update)', () => {
  it('should return a grand total of 112.00 when the cart subtotal is 100.00 (assuming 12% task)', () => {
    const mockCart = [{ id: 1, productName: 'A', quantity: 2, price: 50 }];
    render(<POSTotals cartItems={mockCart} />);

    expect(screen.getByTestId('subtotal-val')).toHaveTextContent('₱100.00');
    expect(screen.getByTestId('total-val')).toHaveTextContent('₱112.00');
  });

  // verifying editability
  it('should update the total when the tax rate is changed to 5%', () => {
    const mockCart = [{ id: 1, productName: 'A', quantity: 2, price: 50 }];
    render(<POSTotals cartItems={mockCart} />);
    
    const taxInput = screen.getByLabelText(/Tax Percentage/i);
    
    // change tax from 12% to 5%
    fireEvent.change(taxInput, { target: { value: '5' } });

    // subtotal 100 + 5% tax = 105
    expect(screen.getByTestId('tax-val')).toHaveTextContent('₱5.00');
    expect(screen.getByTestId('total-val')).toHaveTextContent('₱105.00');
  });

  it('should handle 0% tax correctly', () => {
    const mockCart = [{ id: 1, productName: 'A', quantity: 1, price: 100 }];
    render(<POSTotals cartItems={mockCart} />);
    
    const taxInput = screen.getByLabelText(/Tax Percentage/i);
    fireEvent.change(taxInput, { target: { value: '0' } });

    expect(screen.getByTestId('total-val')).toHaveTextContent('₱100.00');
  });

  it('should treat negative tax rates as 0% to prevent invalid totals', () => {
    const mockCart = [{ id: 1, productName: 'A', quantity: 1, price: 100 }];
    render(<POSTotals cartItems={mockCart} />);
    
    const taxInput = screen.getByLabelText(/Tax Percentage/i);
    
    // simulate user entering a negative tax rate
    fireEvent.change(taxInput, { target: { value: '-12' } });

    // requirement: Subtotal is 100. If tax is negative, it should be clamped to 0.
    // total should be 100, NOT 88.
    expect(screen.getByTestId('tax-val')).toHaveTextContent('₱0.00');
    expect(screen.getByTestId('total-val')).toHaveTextContent('₱100.00');
  });
});