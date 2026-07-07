import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import Receipt from '../../features/pos/components/Receipt';

const mockCart = [
  { id: '1', productName: 'Cotton T-Shirt', price: 350, quantity: 2 },
  { id: '2', productName: 'Vinyl Sticker',  price: 50,  quantity: 1 },
];

describe('Receipt Component', () => {
  it('should render the receipt view', () => {
    render(<Receipt cartItems={mockCart} onClose={() => {}} />);
    expect(screen.getByLabelText('receipt')).toBeTruthy();
    expect(screen.getByText('Receipt')).toBeTruthy();
  });

  it('should render an auto-generated transaction ID with TXN- prefix', () => {
    render(<Receipt cartItems={mockCart} onClose={() => {}} />);
    expect(screen.getByLabelText('transaction id').textContent).toMatch(/^TXN-/);
  });

  it('should render the transaction ID in the correct format TXN-YYYYMMDD-XXXXXX', () => {
    render(<Receipt cartItems={mockCart} onClose={() => {}} />);
    expect(screen.getByLabelText('transaction id').textContent).toMatch(/^TXN-\d{8}-[A-Z0-9]{6}$/);
  });

  it('should render the current date', () => {
    render(<Receipt cartItems={mockCart} onClose={() => {}} />);
    expect(screen.getByLabelText('receipt date').textContent.length).toBeGreaterThan(0);
  });

  it('should render the current time', () => {
    render(<Receipt cartItems={mockCart} onClose={() => {}} />);
    expect(screen.getByLabelText('receipt time').textContent).toMatch(/\d{1,2}:\d{2}/);
  });

  it('should display the correct grand total', () => {
    render(<Receipt cartItems={mockCart} onClose={() => {}} />);
    // 350*2 + 50*1 = 750
    expect(screen.getByLabelText('receipt grand total').textContent).toBe('₱750');
  });

  it('should list all purchased items', () => {
    render(<Receipt cartItems={mockCart} onClose={() => {}} />);
    expect(screen.getByText(/Cotton T-Shirt/)).toBeTruthy();
    expect(screen.getByText(/Vinyl Sticker/)).toBeTruthy();
  });

  it('should call onClose when Close button is clicked', () => {
    const callback = vi.fn();
    render(<Receipt cartItems={mockCart} onClose={callback} />);
    fireEvent.click(screen.getByLabelText('Close receipt'));
    expect(callback).toHaveBeenCalled();
  });
});