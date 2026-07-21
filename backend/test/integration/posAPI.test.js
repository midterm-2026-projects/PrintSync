import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

vi.mock('../../services/posService.js', () => {
  const getErrorMessage = (err) => (err instanceof Error ? err.message : 'Unknown error');

  return {
    posService: {
      getProducts: vi.fn(),
      getProductById: vi.fn(),
      createOrder: vi.fn(),
      getTransactions: vi.fn(),
      getOrderById: vi.fn(),
    },
    getErrorMessage,
    formatCurrency: vi.fn((val) => `₱${val}`),
  };
});

import app from '../../app.js';
import { posService } from '../../services/posService.js';

afterEach(() => {
  vi.clearAllMocks();
});

const mockProduct = {
  id: 1,
  productName: 'T-Shirt',
  price: 350,
  stock: 50,
  category: 'Garment',
  image_url: null,
};

const mockOrder = {
  orderId: 'TXN-20250127-A3F9K2',
  totalAmount: 700,
  createdAt: '2025-01-27T12:00:00.000Z',
};

const mockOrderWithItems = {
  ...mockOrder,
  items: [
    { id: 1, productId: 1, productName: 'T-Shirt', quantity: 2, unitPrice: 350, subtotal: 700 },
  ],
};

const mockTransaction = {
  id: 'TXN-20250127-A3F9K2',
  totalAmount: 700,
  createdAt: '2025-01-27T12:00:00.000Z',
  itemsCount: 2,
};

describe('POS API (routes to controllers to mocked services)', () => {
  describe('POST /pos/orders', () => {
    it('creates an order using the service response', async () => {
      vi.mocked(posService.createOrder).mockResolvedValue(mockOrder);

      const response = await request(app)
        .post('/pos/orders')
        .send({ items: [{ product_id: 1, quantity: 2 }] });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ ok: true, order: mockOrder });
      expect(posService.createOrder).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ product_id: 1, quantity: 2 })])
      );
    });

    it('returns 400 when items array is empty', async () => {
      const response = await request(app)
        .post('/pos/orders')
        .send({ items: [] });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ ok: false, error: 'Order must contain at least one item' });
      expect(posService.createOrder).not.toHaveBeenCalled();
    });

    it('returns 400 when items is missing', async () => {
      const response = await request(app)
        .post('/pos/orders')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(posService.createOrder).not.toHaveBeenCalled();
    });

    it('returns 400 when service throws validation error', async () => {
      vi.mocked(posService.createOrder).mockRejectedValue(new Error('Insufficient stock'));

      const response = await request(app)
        .post('/pos/orders')
        .send({ items: [{ product_id: 1, quantity: 999 }] });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ ok: false, error: 'Insufficient stock' });
    });

    it('returns 400 when service throws product not found error', async () => {
      vi.mocked(posService.createOrder).mockRejectedValue(new Error('Product not found with ID: 999'));

      const response = await request(app)
        .post('/pos/orders')
        .send({ items: [{ product_id: 999, quantity: 1 }] });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ ok: false, error: 'Product not found with ID: 999' });
    });

    it('returns 500 for unexpected service errors', async () => {
      vi.mocked(posService.createOrder).mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/pos/orders')
        .send({ items: [{ product_id: 1, quantity: 1 }] });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ ok: false, error: 'Database connection failed' });
    });
  });

  describe('GET /pos/products', () => {
    it('returns products from the service', async () => {
      vi.mocked(posService.getProducts).mockResolvedValue([mockProduct]);

      const response = await request(app)
        .get('/pos/products')
        .query({ q: 'shirt', category: 'Garment', limit: 25, offset: 5 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true, items: [mockProduct], count: 1 });
      expect(posService.getProducts).toHaveBeenCalledWith('shirt', 'Garment', 25, 5);
    });

    it('returns empty items array when no products match', async () => {
      vi.mocked(posService.getProducts).mockResolvedValue([]);

      const response = await request(app).get('/pos/products').query({ q: 'nonexistent' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true, items: [], count: 0 });
    });

    it('uses default query params when none provided', async () => {
      vi.mocked(posService.getProducts).mockResolvedValue([]);

      await request(app).get('/pos/products');

      expect(posService.getProducts).toHaveBeenCalledWith('', null, 100, 0);
    });
  });

  describe('GET /pos/products/:id', () => {
    it('returns a product from the service', async () => {
      vi.mocked(posService.getProductById).mockResolvedValue(mockProduct);

      const response = await request(app).get(`/pos/products/${mockProduct.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true, item: mockProduct });
      expect(posService.getProductById).toHaveBeenCalledWith(String(mockProduct.id));
    });

    it('returns 404 when the service cannot find the product', async () => {
      vi.mocked(posService.getProductById).mockRejectedValue(new Error('Product not found with id: 999'));

      const response = await request(app).get('/pos/products/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ ok: false, error: 'Product not found with id: 999' });
    });

    it('returns 404 when product ID does not exist', async () => {
      vi.mocked(posService.getProductById).mockRejectedValue(new Error('Product not found with id: 99999'));

      const res = await request(app).get('/pos/products/99999');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ ok: false, error: 'Product not found with id: 99999' });
    });
  });

  describe('GET /pos/orders', () => {
    it('returns orders from the service', async () => {
      vi.mocked(posService.getTransactions).mockResolvedValue([mockTransaction]);

      const response = await request(app)
        .get('/pos/orders')
        .query({ limit: 25, offset: 5 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true, orders: [mockTransaction], count: 1 });
      expect(posService.getTransactions).toHaveBeenCalledWith(25, 5);
    });

    it('returns empty array when no orders exist', async () => {
      vi.mocked(posService.getTransactions).mockResolvedValue([]);

      const response = await request(app).get('/pos/orders');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true, orders: [], count: 0 });
    });

    it('uses default pagination when no query params provided', async () => {
      vi.mocked(posService.getTransactions).mockResolvedValue([]);

      await request(app).get('/pos/orders');

      expect(posService.getTransactions).toHaveBeenCalledWith(50, 0);
    });
  });

  describe('GET /pos/orders/:orderId', () => {
    it('returns an order with items from the service', async () => {
      vi.mocked(posService.getOrderById).mockResolvedValue(mockOrderWithItems);

      const response = await request(app).get(`/pos/orders/${mockOrder.orderId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true, order: mockOrderWithItems });
      expect(posService.getOrderById).toHaveBeenCalledWith(mockOrder.orderId);
    });

    it('returns 404 when the service cannot find the order', async () => {
      vi.mocked(posService.getOrderById).mockRejectedValue(new Error('Order not found with id: TXN-999'));

      const response = await request(app).get('/pos/orders/TXN-999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ ok: false, error: 'Order not found with id: TXN-999' });
    });
  });

  describe('GET /pos/transactions', () => {
    it('returns transaction history (alias for orders)', async () => {
      vi.mocked(posService.getTransactions).mockResolvedValue([mockTransaction]);

      const response = await request(app)
        .get('/pos/transactions')
        .query({ limit: 10, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true, orders: [mockTransaction], count: 1 });
      expect(posService.getTransactions).toHaveBeenCalledWith(10, 0);
    });

    it('returns empty list when no transactions', async () => {
      vi.mocked(posService.getTransactions).mockResolvedValue([]);

      const response = await request(app).get('/pos/transactions');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true, orders: [], count: 0 });
    });
  });
});

