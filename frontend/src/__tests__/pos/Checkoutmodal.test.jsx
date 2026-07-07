import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import CheckoutModal from '../../features/pos/components/Checkoutmodal';

const mockCart = [
  { id: '1', productName: 'Cotton T-Shirt', price: 350, quantity: 2 },
  { id: '2', productName: 'Vinyl Sticker',  price: 50,  quantity: 1 },
  { id: '3', productName: 'Hoodie',          price: 699, quantity: 1 },
];

describe('CheckoutModal Component', () => {
  it('should render the checkout confirmation dialog', () => {
    render(<CheckoutModal cartItems={mockCart} onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Order Confirmation')).toBeTruthy();
  });

  it('should display the correct count of unique items', () => {
    render(<CheckoutModal cartItems={mockCart} onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByLabelText('unique item count').textContent).toBe('3');
  });

  it('should display the correct grand total', () => {
    render(<CheckoutModal cartItems={mockCart} onConfirm={() => {}} onCancel={() => {}} />);
    // 350*2 + 50*1 + 699*1 = 1449
    expect(screen.getByLabelText('checkout grand total').textContent).toBe('₱1,449');
  });

  it('should list all cart items in the modal', () => {
    render(<CheckoutModal cartItems={mockCart} onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByText(/Cotton T-Shirt/)).toBeTruthy();
    expect(screen.getByText(/Vinyl Sticker/)).toBeTruthy();
    expect(screen.getByText(/Hoodie/)).toBeTruthy();
  });

  it('should call onConfirm when Confirm Order is clicked', () => {
    const callback = vi.fn();
    render(<CheckoutModal cartItems={mockCart} onConfirm={callback} onCancel={() => {}} />);
    fireEvent.click(screen.getByLabelText('Confirm order'));
    expect(callback).toHaveBeenCalled();
  });

  it('should call onCancel when Cancel is clicked', () => {
    const callback = vi.fn();
    render(<CheckoutModal cartItems={mockCart} onConfirm={() => {}} onCancel={callback} />);
    fireEvent.click(screen.getByLabelText('Cancel order'));
    expect(callback).toHaveBeenCalled();
  });
});