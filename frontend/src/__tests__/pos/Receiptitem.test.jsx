import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import ReceiptItem from '../../features/pos/components/ReceiptItem';

const mockItem = { id: '1', productName: 'Cotton T-Shirt', price: 350, quantity: 2 };

describe('ReceiptItem Component', () => {
  it('should render the item name', () => {
    render(<ul><ReceiptItem item={mockItem} /></ul>);
    expect(screen.getByLabelText('name of Cotton T-Shirt').textContent).toBe('Cotton T-Shirt');
  });

  it('should render the item quantity', () => {
    render(<ul><ReceiptItem item={mockItem} /></ul>);
    expect(screen.getByLabelText('quantity of Cotton T-Shirt').textContent).toBe('x2');
  });

  it('should render the correct subtotal', () => {
    render(<ul><ReceiptItem item={mockItem} /></ul>);
    // 350 * 2 = 700
    expect(screen.getByLabelText('subtotal for Cotton T-Shirt').textContent).toBe('₱700');
  });

  it('should render nothing when item is null', () => {
    const { container } = render(<ul><ReceiptItem item={null} /></ul>);
    expect(container.querySelector('li')).toBeNull();
  });

  it('should render the unit price', () => {
    render(<ul><ReceiptItem item={mockItem} /></ul>);
    expect(screen.getByLabelText('unit price of Cotton T-Shirt').textContent).toBe('₱350 each');
  });
});