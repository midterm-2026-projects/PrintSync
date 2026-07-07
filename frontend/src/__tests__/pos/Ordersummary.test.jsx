import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import OrderSummary from '../../features/pos/components/Ordersummary';

const mockCart = [
  { id: '1', productName: 'Cotton T-Shirt', price: 350, quantity: 2 },
  { id: '2', productName: 'Vinyl Sticker',  price: 50,  quantity: 1 },
];

describe('OrderSummary Component', () => {
  it('should display grand total of 0 when cart is empty', () => {
    render(<OrderSummary cartItems={[]} onCheckout={() => {}} />);
    expect(screen.getByLabelText('grand total').textContent).toBe('₱0');
  });

  it('should display the correct grand total', () => {
    render(<OrderSummary cartItems={mockCart} onCheckout={() => {}} />);
    // 350*2 + 50*1 = 750
    expect(screen.getByLabelText('grand total').textContent).toBe('₱750');
  });

  it('should update grand total immediately when cart items change', () => {
    const { rerender } = render(<OrderSummary cartItems={mockCart} onCheckout={() => {}} />);
    expect(screen.getByLabelText('grand total').textContent).toBe('₱750');

    rerender(<OrderSummary cartItems={[
      { id: '1', productName: 'Cotton T-Shirt', price: 350, quantity: 3 },
      { id: '2', productName: 'Vinyl Sticker',  price: 50,  quantity: 1 },
    ]} onCheckout={() => {}} />);
    // 350*3 + 50*1 = 1100
    expect(screen.getByLabelText('grand total').textContent).toBe('₱1,100');
  });

  it('should display the correct unique item count', () => {
    render(<OrderSummary cartItems={mockCart} onCheckout={() => {}} />);
    expect(screen.getByLabelText('unique item count').textContent).toBe('2');
  });

  it('should disable checkout button when cart is empty', () => {
    render(<OrderSummary cartItems={[]} onCheckout={() => {}} />);
    expect(screen.getByLabelText('Proceed to checkout').disabled).toBe(true);
  });

  it('should enable checkout button when cart has items', () => {
    render(<OrderSummary cartItems={mockCart} onCheckout={() => {}} />);
    expect(screen.getByLabelText('Proceed to checkout').disabled).toBe(false);
  });

  it('should call onCheckout when checkout button is clicked', () => {
    const callback = vi.fn();
    render(<OrderSummary cartItems={mockCart} onCheckout={callback} />);
    fireEvent.click(screen.getByLabelText('Proceed to checkout'));
    expect(callback).toHaveBeenCalled();
  });
});