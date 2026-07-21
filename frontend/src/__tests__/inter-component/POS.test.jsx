import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';

import POS from '../../pages/POS';

import generateTransactionId from '../../features/pos/services/generatetransactionId';
import { calculateFinancials, formatCurrency } from '../../features/pos/services/posService';

describe('POS Page - renders all POS components and services', () => {
  it('renders POSSearchBar with search input', () => {
    render(<POS />);
    expect(screen.getByLabelText(/Search Inventory/i)).toBeInTheDocument();
  });

  it('renders POSItemList with Product, Stock, and Action columns', () => {
    render(<POS />);
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('renders POSItemList with sample inventory items', () => {
    render(<POS />);
    expect(screen.getByText('Cotton T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Polo Shirt')).toBeInTheDocument();
    expect(screen.getByText('Hoodie')).toBeInTheDocument();
  });

  it('renders POSCart with Transaction Cart heading and empty state', () => {
    render(<POS />);
    expect(screen.getByText('Transaction Cart')).toBeInTheDocument();
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
  });

  it('renders POSTotals with subtotal, tax input, and total display', () => {
    render(<POS />);
    expect(screen.getByTestId('subtotal-val')).toBeInTheDocument();
    expect(screen.getByTestId('subtotal-val')).toHaveTextContent('₱0.00');
    expect(screen.getByLabelText(/Tax Percentage/i)).toBeInTheDocument();
    expect(screen.getByTestId('total-val')).toHaveTextContent('₱0.00');
  });

  it('renders OrderSummary with unique item count, total quantity, grand total, and checkout button', () => {
    render(<POS />);
    expect(screen.getByLabelText('unique item count')).toHaveTextContent('0');
    expect(screen.getByLabelText('total quantity')).toHaveTextContent('0');
    expect(screen.getByLabelText('grand total')).toHaveTextContent('₱0');
    expect(screen.getByRole('button', { name: /Proceed to checkout/i })).toBeInTheDocument();
  });

  it('renders TransactionHistory showing empty state message', () => {
    render(<POS />);
    expect(screen.getByText('No transaction history found.')).toBeInTheDocument();
  });

  it('renders Point of Sale heading', () => {
    render(<POS />);
    expect(screen.getByText('Point of Sale')).toBeInTheDocument();
  });

  it('generateTransactionId service is importable and callable', () => {
    const id = generateTransactionId();
    expect(id).toMatch(/^TXN-\d{8}-[A-Z0-9]{6}$/);
  });

  it('calculateFinancials service is importable and callable', () => {
    const cart = [
      { id: 1, productName: 'Test', price: 100, quantity: 2 },
    ];
    const result = calculateFinancials(cart, 12);
    expect(result.subtotal).toBe(200);
    expect(result.tax).toBe(24);
    expect(result.total).toBe(224);
    expect(result.safeTaxRate).toBe(12);
  });

  it('formatCurrency service is importable and callable', () => {
    const formatted = formatCurrency(1234.5);
    expect(formatted).toBe('₱1,234.50');
  });
});
