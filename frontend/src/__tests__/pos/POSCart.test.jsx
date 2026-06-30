import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import POSCart from '../../features/pos/components/POSCart';

describe('POS Cart Management (Week 2 Day 1)', () => {
  const mockCart = [
    { id: 1, productName: 'Cotton Tee', quantity: 1 }
  ];

  it('should display quantity adjustment buttons (+ and -) for each item', () => {
    render(<POSCart cartItems={mockCart} onUpdateQty={() => {}} />);
    expect(screen.getByRole('button', { name: /\+/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /-/ })).toBeInTheDocument();
  });

  it('should call onUpdateQty with an increased count when + is clicked', () => {
    const onUpdateQtyMock = vi.fn();
    render(<POSCart cartItems={mockCart} onUpdateQty={onUpdateQtyMock} />);
    
    fireEvent.click(screen.getByRole('button', { name: /\+/ }));
    
    // Expect the first item (id: 1) to have its quantity increased to 2
    expect(onUpdateQtyMock).toHaveBeenCalledWith(1, 2);
  });

  it('should call onUpdateQty with 0 when - is clicked on an item with quantity 1', () => {
    const onUpdateQtyMock = vi.fn();
    render(<POSCart cartItems={mockCart} onUpdateQty={onUpdateQtyMock} />);
    
    fireEvent.click(screen.getByRole('button', { name: /-/ }));
    
    // Requirement: If quantity goes below 1, it should be removed (represented here by calling with 0)
    expect(onUpdateQtyMock).toHaveBeenCalledWith(1, 0);
  });
});