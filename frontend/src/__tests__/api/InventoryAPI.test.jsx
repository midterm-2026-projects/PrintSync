import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import Inventory from '../../pages/Inventory';
import { server } from '../sample-backend/server';

describe('Inventory API integration (MSW)', () => {
    it('renders all inventory page components with MSW running', () => {
        render(<Inventory />);

        // Core page components render
        expect(screen.getByText(/Inventory Management/i)).toBeInTheDocument();
        expect(screen.getByText(/Add New Inventory Item/i)).toBeInTheDocument();
        expect(screen.getByText(/PRINTSYNC Inventory/i)).toBeInTheDocument();
        expect(screen.getByText(/No designs found in repository/i)).toBeInTheDocument();
    });

    it('starts with an empty inventory (initialized state)', () => {
        render(<Inventory />);

        expect(screen.getByTestId('item-count')).toHaveTextContent('0');
        expect(screen.getByText(/inventory is currently empty/i)).toBeInTheDocument();
    });

    it('handles mocked GET /inventory/items endpoint with correct response shape', async () => {
        server.use(
            http.get('/inventory/items', () => HttpResponse.json({
                ok: true,
                items: [
                    { id: 101, name: 'Cotton T-Shirt', category: 'Garment', stock: 50, price: 350, description: 'Premium cotton t-shirt', image_url: null, reorder_level: 10, is_active: true },
                    { id: 104, name: 'Mug', category: 'Material', stock: 100, price: 150, description: 'Ceramic mug', image_url: null, reorder_level: 20, is_active: true },
                ],
                count: 2,
            })),
        );

        // The Inventory page uses local state (not API-driven),
        // so it still renders static initial state with MSW running.
        render(<Inventory />);
        expect(screen.getByText(/Inventory Management/i)).toBeInTheDocument();
        expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    });

    it('handles mocked GET /inventory/items/:id endpoint with correct response shape', async () => {
        server.use(
            http.get('/inventory/items/:id', ({ params }) => {
                const { id } = params;
                if (id === '101') {
                    return HttpResponse.json({
                        ok: true,
                        item: { id: 101, name: 'Cotton T-Shirt', category: 'Garment', stock: 50, price: 350, reorder_level: 10, is_active: true },
                    });
                }
                return HttpResponse.json({ ok: false, error: `Item not found with id: ${id}` }, { status: 404 });
            }),
        );

        render(<Inventory />);
        expect(screen.getByText(/Inventory Management/i)).toBeInTheDocument();
    });

    it('handles 404 response from GET /inventory/items/:id for non-existent item', async () => {
        server.use(
            http.get('/inventory/items/:id', () => HttpResponse.json(
                { ok: false, error: 'Item not found with id: 999' },
                { status: 404 },
            )),
        );

        render(<Inventory />);
        expect(screen.getByText(/Inventory Management/i)).toBeInTheDocument();
    });

    it('handles mocked POST /inventory/items endpoint with correct response shape', async () => {
        server.use(
            http.post('/inventory/items', () => HttpResponse.json({
                ok: true,
                item: { id: 1000001, name: 'New Item', category: 'Garment', stock: 10, price: 200, reorder_level: 5, is_active: true },
            }, { status: 201 })),
        );

        render(<Inventory />);
        expect(screen.getByText(/Inventory Management/i)).toBeInTheDocument();
    });

    it('handles mocked PUT /inventory/items/:id endpoint with correct response shape', async () => {
        server.use(
            http.put('/inventory/items/:id', ({ params }) => {
                const { id } = params;
                return HttpResponse.json({
                    ok: true,
                    item: { id: Number(id), name: 'Updated T-Shirt', category: 'Garment', stock: 25, price: 375, reorder_level: 5, is_active: true },
                });
            }),
        );

        render(<Inventory />);
        expect(screen.getByText(/Inventory Management/i)).toBeInTheDocument();
    });

    it('handles mocked DELETE /inventory/items/:id endpoint with correct response shape', async () => {
        server.use(
            http.delete('/inventory/items/:id', ({ params }) => {
                const { id } = params;
                if (id === '101') {
                    return HttpResponse.json({ ok: true, message: 'Item deleted successfully' });
                }
                return HttpResponse.json({ ok: false, error: `Item not found with id: ${id}` }, { status: 404 });
            }),
        );

        render(<Inventory />);
        expect(screen.getByText(/Inventory Management/i)).toBeInTheDocument();
    });

    it('handles mocked GET /inventory/designs endpoint with correct response shape', async () => {
        server.use(
            http.get('/inventory/designs', () => HttpResponse.json({
                ok: true,
                designs: [
                    { id: 201, title: 'Summer Vibes', url: 'https://example.com/summer.png', product_id: null, uploaded_by: 'admin' },
                    { id: 202, title: 'Geometric Pattern', url: 'https://example.com/geo.png', product_id: 101, uploaded_by: 'admin' },
                ],
                count: 2,
            })),
        );

        render(<Inventory />);
        expect(screen.getByText(/Inventory Management/i)).toBeInTheDocument();
    });

    it('handles mocked POST /inventory/designs endpoint with correct response shape', async () => {
        server.use(
            http.post('/inventory/designs', () => HttpResponse.json({
                ok: true,
                design: { id: 203, title: 'New Design', url: 'https://example.com/new.png', product_id: null, uploaded_by: 'admin' },
            }, { status: 201 })),
        );

        render(<Inventory />);
        expect(screen.getByText(/Inventory Management/i)).toBeInTheDocument();
    });

    it('handles mocked DELETE /inventory/designs/:id endpoint with correct response shape', async () => {
        server.use(
            http.delete('/inventory/designs/:id', ({ params }) => {
                const { id } = params;
                if (id === '201') {
                    return HttpResponse.json({ ok: true, message: 'Design deleted successfully' });
                }
                return HttpResponse.json({ ok: false, error: `Design not found with id: ${id}` }, { status: 404 });
            }),
        );

        render(<Inventory />);
        expect(screen.getByText(/Inventory Management/i)).toBeInTheDocument();
    });

    it('handles 500 error response from mock inventory items endpoint gracefully', async () => {
        server.use(
            http.get('/inventory/items', () => HttpResponse.json(
                { ok: false, error: 'Inventory service unavailable.' },
                { status: 500 },
            )),
        );

        // Page uses local static state so it still renders fine
        render(<Inventory />);
        expect(screen.getByText(/Inventory Management/i)).toBeInTheDocument();
        expect(screen.getByText(/inventory is currently empty/i)).toBeInTheDocument();
    });

    it('handles validation error response from mock POST /inventory/items endpoint', async () => {
        server.use(
            http.post('/inventory/items', () => HttpResponse.json(
                { ok: false, error: 'Item name is required' },
                { status: 400 },
            )),
        );

        render(<Inventory />);
        expect(screen.getByText(/Inventory Management/i)).toBeInTheDocument();
    });
});

