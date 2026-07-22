import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { http, HttpResponse } from 'msw';

import POS from '../../pages/POS';
import { server } from '../sample-backend/server';

import generateTransactionId from '../../features/pos/services/generatetransactionId';
import { calculateFinancials, formatCurrency } from '../../features/pos/services/posService';

/*
 * Helper: override GET /pos/transactions to return empty orders
 * so tests that check "No transaction history found." work correctly.
 */
function useEmptyTransactions() {
  server.use(
    http.get('/pos/transactions', () => HttpResponse.json({
      ok: true,
      orders: [],
      count: 0,
    })),
  );
}

describe('POS Page (inter-component)', () => {
  it('renders POSSearchBar with search input', async () => {
    render(<POS />);
    expect(await screen.findByLabelText(/Search Inventory/i)).toBeInTheDocument();
  });

  it('renders POSItemList with sample inventory items', async () => {
    render(<POS />);
    expect(await screen.findByText('Cotton T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Polo Shirt')).toBeInTheDocument();
    expect(screen.getByText('Hoodie')).toBeInTheDocument();
  });

  it('renders POSCart with Transaction Cart heading and empty state', async () => {
    render(<POS />);
    expect(await screen.findByText('Transaction Cart')).toBeInTheDocument();
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
  });

  it('renders POSTotals with subtotal, tax input, and total display', async () => {
    render(<POS />);
    expect(await screen.findByTestId('subtotal-val')).toHaveTextContent('₱0.00');
    expect(screen.getByLabelText(/Tax Percentage/i)).toBeInTheDocument();
    expect(screen.getByTestId('total-val')).toHaveTextContent('₱0.00');
  });

  it('renders OrderSummary with checkout button disabled when cart is empty', async () => {
    render(<POS />);
    expect(await screen.findByLabelText('unique item count')).toHaveTextContent('0');
    expect(screen.getByLabelText('total quantity')).toHaveTextContent('0');
    expect(screen.getByLabelText('grand total')).toHaveTextContent('₱0');
    expect(screen.getByRole('button', { name: /Proceed to checkout/i })).toBeDisabled();
  });

  it('renders TransactionHistory empty state when no transactions exist', async () => {
    useEmptyTransactions();
    render(<POS />);
    expect(await screen.findByText('No transaction history found.')).toBeInTheDocument();
  });

  it('renders Point of Sale heading', () => {
    render(<POS />);
    expect(screen.getByText('Point of Sale')).toBeInTheDocument();
  });
});

describe('POS Page - renders all POS components and services', () => {
  it('renders POSSearchBar, POSItemList, POSCart, POSTotals, OrderSummary, CheckoutModal, Receipt, TransactionHistory, and ReceiptItem', async () => {
    useEmptyTransactions();
    render(<POS />);

    // POSSearchBar
    expect(await screen.findByLabelText(/Search Inventory/i)).toBeInTheDocument();

    // POSItemList with sample data
    expect(screen.getByText('Cotton T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Mug')).toBeInTheDocument();
    expect(screen.getByText('Cap')).toBeInTheDocument();

    // POSCart
    expect(screen.getByText('Transaction Cart')).toBeInTheDocument();

    // POSTotals
    expect(screen.getByTestId('subtotal-val')).toHaveTextContent('₱0.00');

    // OrderSummary
    expect(screen.getByLabelText('unique item count')).toHaveTextContent('0');

    // TransactionHistory
    expect(screen.getByText('No transaction history found.')).toBeInTheDocument();
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

describe('POS Page - POSSearchBar drives POSItemList filtering', () => {
  it('shows all inventory items by default', async () => {
    render(<POS />);
    expect(await screen.findByText('Cotton T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Polo Shirt')).toBeInTheDocument();
    expect(screen.getByText('Hoodie')).toBeInTheDocument();
    expect(screen.getByText('Mug')).toBeInTheDocument();
    expect(screen.getByText('Cap')).toBeInTheDocument();
  });

  it('typing in search bar filters items to matching names', async () => {
    render(<POS />);
    const searchInput = await screen.findByLabelText(/Search Inventory/i);

    fireEvent.change(searchInput, { target: { value: 'Mug' } });

    expect(screen.getByText('Mug')).toBeInTheDocument();
    expect(screen.queryByText('Cotton T-Shirt')).not.toBeInTheDocument();
    expect(screen.queryByText('Polo Shirt')).not.toBeInTheDocument();
    expect(screen.queryByText('Hoodie')).not.toBeInTheDocument();
    expect(screen.queryByText('Cap')).not.toBeInTheDocument();
  });

  it('typing partial name filters items containing the substring', async () => {
    render(<POS />);
    const searchInput = await screen.findByLabelText(/Search Inventory/i);

    fireEvent.change(searchInput, { target: { value: 'Shirt' } });

    expect(screen.getByText('Cotton T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Polo Shirt')).toBeInTheDocument();
    expect(screen.queryByText('Hoodie')).not.toBeInTheDocument();
  });

  it('searching with no matches shows "No matching items found."', async () => {
    render(<POS />);
    const searchInput = await screen.findByLabelText(/Search Inventory/i);

    fireEvent.change(searchInput, { target: { value: 'XYZ123' } });

    expect(screen.getByText('No matching items found.')).toBeInTheDocument();
  });

  it('clearing search restores all inventory items', async () => {
    render(<POS />);
    const searchInput = await screen.findByLabelText(/Search Inventory/i);

    // Filter first
    fireEvent.change(searchInput, { target: { value: 'Mug' } });
    expect(screen.queryByText('Cotton T-Shirt')).not.toBeInTheDocument();

    // Clear
    fireEvent.change(searchInput, { target: { value: '' } });

    expect(screen.getByText('Cotton T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Polo Shirt')).toBeInTheDocument();
    expect(screen.getByText('Hoodie')).toBeInTheDocument();
    expect(screen.getByText('Mug')).toBeInTheDocument();
    expect(screen.getByText('Cap')).toBeInTheDocument();
  });

  it('search is case-insensitive', async () => {
    render(<POS />);
    const searchInput = await screen.findByLabelText(/Search Inventory/i);

    fireEvent.change(searchInput, { target: { value: 'cotton' } });

    expect(screen.getByText('Cotton T-Shirt')).toBeInTheDocument();
  });
});

describe('POS Page - Add to Cart and Checkout flow', () => {
  it('adding item to cart increments cart item count', async () => {
    render(<POS />);

    const addButtons = await screen.findAllByText('Add to Cart');
    fireEvent.click(addButtons[0]);

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
  });

  it('adding same item twice increments quantity reflected in subtotal', async () => {
    render(<POS />);

    const addButtons = await screen.findAllByText('Add to Cart');
    fireEvent.click(addButtons[0]);
    fireEvent.click(addButtons[0]);

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    // Cotton T-Shirt appears in both inventory table and cart table
    expect(screen.getAllByText('Cotton T-Shirt').length).toBe(2);
    // Subtotal = 350 x 2 = 700 confirms quantity incremented to 2
    expect(screen.getByTestId('subtotal-val')).toHaveTextContent('₱700.00');
  });

  it('cart items update the totals display', async () => {
    render(<POS />);

    const addButtons = await screen.findAllByText('Add to Cart');
    fireEvent.click(addButtons[0]);

    // Cotton T-Shirt has price 350, quantity 1
    expect(screen.getByTestId('subtotal-val')).toHaveTextContent('₱350.00');
    expect(screen.getByTestId('total-val')).toHaveTextContent('₱392.00');
  });

  it('adding multiple items updates unique item count and grand total in OrderSummary', async () => {
    render(<POS />);

    const addButtons = await screen.findAllByText('Add to Cart');
    fireEvent.click(addButtons[0]); // Cotton T-Shirt (350)
    fireEvent.click(addButtons[1]); // Polo Shirt (450)

    expect(screen.getByLabelText('unique item count')).toHaveTextContent('2');
    expect(screen.getByLabelText('total quantity')).toHaveTextContent('2');
    expect(screen.getByLabelText('grand total')).toHaveTextContent('₱800');
  });

  it('checkout button is disabled when cart is empty', async () => {
    render(<POS />);
    expect(await screen.findByRole('button', { name: /Proceed to checkout/i })).toBeDisabled();
  });

  it('checkout button becomes enabled when items are in cart', async () => {
    render(<POS />);

    const addButtons = await screen.findAllByText('Add to Cart');
    fireEvent.click(addButtons[0]);

    expect(screen.getByRole('button', { name: /Proceed to checkout/i })).not.toBeDisabled();
  });
});
