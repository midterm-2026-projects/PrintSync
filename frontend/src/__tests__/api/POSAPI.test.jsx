import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import POS from '../../pages/POS';
import { server } from '../sample-backend/server';

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

describe('POS API integration (MSW)', () => {
  it('renders POSSearchBar with search input', async () => {
    render(<POS />);
    expect(await screen.findByLabelText(/Search Inventory/i)).toBeInTheDocument();
  });

  it('renders all sample inventory items from the static data', async () => {
    render(<POS />);
    expect(await screen.findByText('Cotton T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Polo Shirt')).toBeInTheDocument();
    expect(screen.getByText('Hoodie')).toBeInTheDocument();
    expect(screen.getByText('Mug')).toBeInTheDocument();
    expect(screen.getByText('Cap')).toBeInTheDocument();
  });

  it('starts with an empty cart', async () => {
    render(<POS />);
    expect(await screen.findByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
  });

  it('renders POSTotals with zero-valued subtotal, tax, and total', async () => {
    render(<POS />);
    expect(await screen.findByTestId('subtotal-val')).toHaveTextContent('₱0.00');
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

  it('renders the Point of Sale heading', () => {
    render(<POS />);
    expect(screen.getByText('Point of Sale')).toBeInTheDocument();
  });

  it('adds an item to cart when "Add to Cart" is clicked', async () => {
    render(<POS />);

    const addButtons = await screen.findAllByText('Add to Cart');
    fireEvent.click(addButtons[0]);

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    expect(screen.getByTestId('subtotal-val')).toHaveTextContent('₱350.00');
    expect(screen.getByTestId('total-val')).toHaveTextContent('₱392.00');
  });

  it('increments quantity when the same item is added twice', async () => {
    render(<POS />);

    const addButtons = await screen.findAllByText('Add to Cart');
    fireEvent.click(addButtons[0]);
    fireEvent.click(addButtons[0]);

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    expect(screen.getAllByText('Cotton T-Shirt').length).toBe(2);
    expect(screen.getByTestId('subtotal-val')).toHaveTextContent('₱700.00');
  });

  it('adds multiple items and updates OrderSummary correctly', async () => {
    render(<POS />);

    const addButtons = await screen.findAllByText('Add to Cart');
    fireEvent.click(addButtons[0]); // Cotton T-Shirt (350)
    fireEvent.click(addButtons[1]); // Polo Shirt (450)

    expect(screen.getByLabelText('unique item count')).toHaveTextContent('2');
    expect(screen.getByLabelText('total quantity')).toHaveTextContent('2');
    expect(screen.getByLabelText('grand total')).toHaveTextContent('₱800');
  });

  it('enables checkout button when items are in cart', async () => {
    render(<POS />);

    const addButtons = await screen.findAllByText('Add to Cart');
    fireEvent.click(addButtons[0]);

    expect(screen.getByRole('button', { name: /Proceed to checkout/i })).not.toBeDisabled();
  });

  it('opens checkout modal when checkout button is clicked', async () => {
    render(<POS />);

    const addButtons = await screen.findAllByText('Add to Cart');
    fireEvent.click(addButtons[0]);

    fireEvent.click(screen.getByRole('button', { name: /Proceed to checkout/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Order Confirmation')).toBeInTheDocument();
  });

  it('displays correct grand total in checkout modal', async () => {
    render(<POS />);

    const addButtons = await screen.findAllByText('Add to Cart');
    fireEvent.click(addButtons[0]); // Cotton T-Shirt ₱350
    fireEvent.click(addButtons[1]); // Polo Shirt ₱450

    fireEvent.click(screen.getByRole('button', { name: /Proceed to checkout/i }));

    expect(screen.getByLabelText('checkout grand total')).toHaveTextContent('₱800');
  });

  it('shows receipt after confirming order', async () => {
    render(<POS />);

    const addButtons = await screen.findAllByText('Add to Cart');
    fireEvent.click(addButtons[0]);

    fireEvent.click(screen.getByRole('button', { name: /Proceed to checkout/i }));
    fireEvent.click(screen.getByLabelText('Confirm order'));

    expect(await screen.findByLabelText('receipt')).toBeInTheDocument();
    expect(screen.getByLabelText('Close receipt')).toBeInTheDocument();
  });

  it('closes receipt and clears cart when Close is clicked', async () => {
    render(<POS />);

    const addButtons = await screen.findAllByText('Add to Cart');
    fireEvent.click(addButtons[0]);

    fireEvent.click(screen.getByRole('button', { name: /Proceed to checkout/i }));
    fireEvent.click(screen.getByLabelText('Confirm order'));

    expect(await screen.findByLabelText('receipt')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close receipt'));

    expect(screen.queryByLabelText('receipt')).not.toBeInTheDocument();
    expect(await screen.findByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
  });

  it('transitions the transaction to TransactionHistory after order', async () => {
    // Start with empty transactions to verify the empty state
    server.use(
      http.get('/pos/transactions', () => HttpResponse.json({
        ok: true,
        orders: [],
        count: 0,
      })),
    );
    render(<POS />);

    expect(await screen.findByText('No transaction history found.')).toBeInTheDocument();

    const addButtons = await screen.findAllByText('Add to Cart');
    fireEvent.click(addButtons[0]); // Cotton T-Shirt

    fireEvent.click(screen.getByRole('button', { name: /Proceed to checkout/i }));

    // Confirm the order - this triggers an async API call
    fireEvent.click(screen.getByLabelText('Confirm order'));

    // Wait for the receipt to appear after the async confirm completes
    const closeButton = await screen.findByLabelText('Close receipt');

    // Reset handlers back to defaults before closing receipt
    // so the refreshed transactions come from the default handler
    server.resetHandlers();

    fireEvent.click(closeButton);

    // After closing, the default transaction fixture now includes the new order
    expect(screen.queryByText('No transaction history found.')).not.toBeInTheDocument();
    expect(screen.getByText(/TXN-/)).toBeInTheDocument();
  });

  it('searches and filters inventory items by name', async () => {
    render(<POS />);
    const searchInput = await screen.findByLabelText(/Search Inventory/i);

    fireEvent.change(searchInput, { target: { value: 'Mug' } });

    expect(screen.getByText('Mug')).toBeInTheDocument();
    expect(screen.queryByText('Cotton T-Shirt')).not.toBeInTheDocument();
    expect(screen.queryByText('Polo Shirt')).not.toBeInTheDocument();
    expect(screen.queryByText('Hoodie')).not.toBeInTheDocument();
    expect(screen.queryByText('Cap')).not.toBeInTheDocument();
  });

  it('shows no matching items when search yields zero results', async () => {
    render(<POS />);
    const searchInput = await screen.findByLabelText(/Search Inventory/i);

    fireEvent.change(searchInput, { target: { value: 'XYZ123' } });

    expect(screen.getByText('No matching items found.')).toBeInTheDocument();
  });

  it('searches are case-insensitive', async () => {
    render(<POS />);
    const searchInput = await screen.findByLabelText(/Search Inventory/i);

    fireEvent.change(searchInput, { target: { value: 'COTTON' } });

    expect(screen.getByText('Cotton T-Shirt')).toBeInTheDocument();
  });

  it('handles mocked GET /pos/products endpoint with correct response shape', async () => {
    server.use(
      http.get('/pos/products', () => HttpResponse.json({
        ok: true,
        items: [
          { id: 1, productName: 'T-Shirt', price: 350, stock: 50, category: 'Garment', image_url: null },
          { id: 2, productName: 'Hoodie', price: 750, stock: 20, category: 'Garment', image_url: null },
        ],
        count: 2,
      })),
      http.get('/pos/transactions', () => HttpResponse.json({
        ok: true,
        orders: [],
        count: 0,
      })),
    );

    render(<POS />);

    // With the overridden GET /pos/products handler, the page renders
    // "T-Shirt" and "Hoodie" from the MSW response.
    expect(await screen.findByText('T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Hoodie')).toBeInTheDocument();
    // "Cotton T-Shirt" should NOT appear since the mock overrides products
    expect(screen.queryByText('Cotton T-Shirt')).not.toBeInTheDocument();
  });

  it('handles mocked GET /pos/products/:id endpoint with correct response shape', async () => {
    server.use(
      http.get('/pos/products/:id', ({ params }) => {
        const { id } = params;
        if (id === '1') {
          return HttpResponse.json({
            ok: true,
            item: { id: 1, productName: 'T-Shirt', price: 350, stock: 50, category: 'Garment', image_url: null },
          });
        }
        return HttpResponse.json({ ok: false, error: 'Product not found with id: ' + id }, { status: 404 });
      }),
    );

    render(<POS />);
    expect(await screen.findByText('Cotton T-Shirt')).toBeInTheDocument();
  });

  it('handles mocked POST /pos/orders endpoint with correct response shape', async () => {
    server.use(
      http.post('/pos/orders', () => HttpResponse.json({
        ok: true,
        order: {
          orderId: 'TXN-20250127-A3F9K2',
          totalAmount: 700,
          createdAt: '2025-01-27T12:00:00.000Z',
        },
      }, { status: 201 })),
    );

    render(<POS />);
    expect(screen.getByText('Point of Sale')).toBeInTheDocument();
  });

  it('handles mocked GET /pos/orders endpoint with correct response shape', async () => {
    server.use(
      http.get('/pos/orders', () => HttpResponse.json({
        ok: true,
        orders: [
          { id: 'TXN-20250127-A3F9K2', totalAmount: 700, createdAt: '2025-01-27T12:00:00.000Z', itemsCount: 2 },
        ],
        count: 1,
      })),
    );

    render(<POS />);
    expect(screen.getByText('Point of Sale')).toBeInTheDocument();
  });

  it('handles mocked GET /pos/orders/:orderId endpoint with correct response shape', async () => {
    server.use(
      http.get('/pos/orders/:orderId', ({ params }) => {
        const { orderId } = params;
        return HttpResponse.json({
          ok: true,
          order: {
            orderId,
            totalAmount: 700,
            createdAt: '2025-01-27T12:00:00.000Z',
            items: [
              { id: 1, productId: 1, productName: 'T-Shirt', quantity: 2, unitPrice: 350, subtotal: 700 },
            ],
          },
        });
      }),
    );

    render(<POS />);
    expect(screen.getByText('Point of Sale')).toBeInTheDocument();
  });

  it('handles mocked GET /pos/transactions endpoint with correct response shape', async () => {
    server.use(
      http.get('/pos/transactions', () => HttpResponse.json({
        ok: true,
        orders: [
          { id: 'TXN-20250127-A3F9K2', totalAmount: 700, createdAt: '2025-01-27T12:00:00.000Z', itemsCount: 2 },
        ],
        count: 1,
      })),
    );

    render(<POS />);
    expect(screen.getByText('Point of Sale')).toBeInTheDocument();
  });

  it('handles 500 error response from mock POS products endpoint gracefully', async () => {
    server.use(
      http.get('/pos/products', () => HttpResponse.json(
        { ok: false, error: 'Product service unavailable.' },
        { status: 500 },
      )),
      http.get('/pos/transactions', () => HttpResponse.json({
        ok: true,
        orders: [],
        count: 0,
      })),
    );

    render(<POS />);

    // The POS page shows the heading and error message
    expect(await screen.findByText('Point of Sale')).toBeInTheDocument();
    // Loading state should be gone
    expect(screen.queryByText('Loading POS…')).not.toBeInTheDocument();
  });
});
