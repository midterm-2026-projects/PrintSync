import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../models/posModel.js', () => ({
  posModel: {
    getAllProducts: vi.fn(),
    searchProducts: vi.fn(),
    getProductById: vi.fn(),
    createOrder: vi.fn(),
    getAllOrders: vi.fn(),
    getOrderById: vi.fn(),
  },
}));

import { posService, generateTransactionId, validateAndEnrichOrderItems } from '../../services/posService.js';
import { posModel } from '../../models/posModel.js';

describe('posService - generateTransactionId', () => {
  it('should return a string in TXN-YYYYMMDD-XXXXXX format', () => {
    const id = generateTransactionId();
    expect(id).toMatch(/^TXN-\d{8}-[A-Z0-9]{6}$/);
  });

  it('should generate unique IDs on successive calls', () => {
    const ids = new Set(Array.from({ length: 10 }, () => generateTransactionId()));
    expect(ids.size).toBe(10);
  });
});

describe('posService - getProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call getAllProducts when no search query', async () => {
    const mockItems = [
      { id: 1, productName: 'T-Shirt', price: 350, stock: 50 },
      { id: 2, productName: 'Mug', price: 250, stock: 100 },
    ];
    vi.mocked(posModel.getAllProducts).mockResolvedValue(mockItems);

    const result = await posService.getProducts('', null, 100, 0);

    expect(posModel.getAllProducts).toHaveBeenCalledWith({ category: null, limit: 100, offset: 0 });
    expect(result).toEqual(mockItems);
  });

  it('should call searchProducts when a search query is provided', async () => {
    const mockItems = [{ id: 1, productName: 'T-Shirt', price: 350, stock: 50 }];
    vi.mocked(posModel.searchProducts).mockResolvedValue(mockItems);

    const result = await posService.getProducts('Shirt', null, 100, 0);

    expect(posModel.searchProducts).toHaveBeenCalledWith('Shirt', { category: null, limit: 100, offset: 0 });
    expect(result).toEqual(mockItems);
  });

  it('should pass category filter to getAllProducts', async () => {
    vi.mocked(posModel.getAllProducts).mockResolvedValue([]);

    await posService.getProducts('', 'Garment', 50, 10);

    expect(posModel.getAllProducts).toHaveBeenCalledWith({ category: 'Garment', limit: 50, offset: 10 });
  });

  it('should pass category filter to searchProducts', async () => {
    vi.mocked(posModel.searchProducts).mockResolvedValue([]);

    await posService.getProducts('Shirt', 'Garment', 25, 5);

    expect(posModel.searchProducts).toHaveBeenCalledWith('Shirt', { category: 'Garment', limit: 25, offset: 5 });
  });

  it('should return empty array when no items match', async () => {
    vi.mocked(posModel.getAllProducts).mockResolvedValue([]);

    const result = await posService.getProducts('', null, 100, 0);

    expect(result).toEqual([]);
  });

  it('should treat whitespace-only query as no search', async () => {
    vi.mocked(posModel.getAllProducts).mockResolvedValue([]);

    await posService.getProducts('   ', null, 100, 0);

    expect(posModel.getAllProducts).toHaveBeenCalled();
    expect(posModel.searchProducts).not.toHaveBeenCalled();
  });
});

describe('posService - getProductById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return product when found', async () => {
    const mockProduct = { id: 1, productName: 'T-Shirt', price: 350, stock: 50 };
    vi.mocked(posModel.getProductById).mockResolvedValue(mockProduct);

    const result = await posService.getProductById(1);

    expect(posModel.getProductById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockProduct);
  });

  it('should throw error when product not found', async () => {
    vi.mocked(posModel.getProductById).mockResolvedValue(null);

    await expect(posService.getProductById(999)).rejects.toThrow('Product not found with id: 999');
  });

  it('should throw error when ID is null', async () => {
    await expect(posService.getProductById(null)).rejects.toThrow('Product ID is required');
  });

  it('should throw error when ID is undefined', async () => {
    await expect(posService.getProductById(undefined)).rejects.toThrow('Product ID is required');
  });
});

describe('posService - validateAndEnrichOrderItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw on empty items array', async () => {
    await expect(validateAndEnrichOrderItems([])).rejects.toThrow('Order must contain at least one item');
  });

  it('should throw on null items', async () => {
    await expect(validateAndEnrichOrderItems(null)).rejects.toThrow('Order must contain at least one item');
  });

  it('should throw on missing product_id', async () => {
    await expect(validateAndEnrichOrderItems([{ quantity: 2 }])).rejects.toThrow('must have a product_id');
  });

  it('should throw on invalid quantity (0)', async () => {
    await expect(validateAndEnrichOrderItems([{ product_id: 1, quantity: 0 }])).rejects.toThrow('Invalid quantity');
  });

  it('should throw on invalid quantity (negative)', async () => {
    await expect(validateAndEnrichOrderItems([{ product_id: 1, quantity: -1 }])).rejects.toThrow('Invalid quantity');
  });

  it('should throw on non-integer quantity', async () => {
    await expect(validateAndEnrichOrderItems([{ product_id: 1, quantity: 2.5 }])).rejects.toThrow('Invalid quantity');
  });

  it('should throw when product not found in DB', async () => {
    vi.mocked(posModel.getProductById).mockResolvedValue(null);

    await expect(validateAndEnrichOrderItems([{ product_id: 999, quantity: 1 }])).rejects.toThrow('Product not found with ID: 999');
  });

  it('should throw on insufficient stock', async () => {
    vi.mocked(posModel.getProductById).mockResolvedValue({
      id: 1,
      productName: 'T-Shirt',
      price: 350,
      stock: 2,
    });

    await expect(validateAndEnrichOrderItems([{ product_id: 1, quantity: 5 }])).rejects.toThrow(
      'Insufficient stock for "T-Shirt": requested 5, available 2'
    );
  });

  it('should enrich items with product data and calculate totals', async () => {
    vi.mocked(posModel.getProductById)
      .mockResolvedValueOnce({ id: 1, productName: 'T-Shirt', price: 350, stock: 50 })
      .mockResolvedValueOnce({ id: 2, productName: 'Mug', price: 250, stock: 100 });

    const result = await validateAndEnrichOrderItems([
      { product_id: 1, quantity: 2 },
      { product_id: 2, quantity: 3 },
    ]);

    expect(result.enrichedItems).toEqual([
      { product_id: 1, product_name: 'T-Shirt', quantity: 2, unit_price: 350, subtotal: 700 },
      { product_id: 2, product_name: 'Mug', quantity: 3, unit_price: 250, subtotal: 750 },
    ]);
    expect(result.totalAmount).toBe(1450);
    expect(posModel.getProductById).toHaveBeenCalledTimes(2);
  });

  it('should handle a single item order correctly', async () => {
    vi.mocked(posModel.getProductById).mockResolvedValue({ id: 1, productName: 'Poster', price: 150, stock: 20 });

    const result = await validateAndEnrichOrderItems([{ product_id: 1, quantity: 1 }]);

    expect(result.enrichedItems).toHaveLength(1);
    expect(result.enrichedItems[0].subtotal).toBe(150);
    expect(result.totalAmount).toBe(150);
  });
});

describe('posService - createOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create order successfully with valid items', async () => {
    const mockProduct = { id: 1, productName: 'T-Shirt', price: 350, stock: 50 };
    vi.mocked(posModel.getProductById).mockResolvedValue(mockProduct);

    const mockOrder = {
      orderId: 'TXN-20250127-A3F9K2',
      totalAmount: 700,
      createdAt: '2025-01-27T12:00:00.000Z',
    };
    vi.mocked(posModel.createOrder).mockResolvedValue(mockOrder);

    const result = await posService.createOrder([{ product_id: 1, quantity: 2 }]);

    expect(result).toEqual(mockOrder);

    // Verify createOrder was called with correct params
    const callArgs = vi.mocked(posModel.createOrder).mock.calls[0];
    expect(callArgs[0]).toMatch(/^TXN-\d{8}-[A-Z0-9]{6}$/); // orderId
    expect(callArgs[1]).toBe(700); // totalAmount
    expect(callArgs[2]).toEqual([
      { product_id: 1, product_name: 'T-Shirt', quantity: 2, unit_price: 350, subtotal: 700 },
    ]);
  });

  it('should propagate validation errors from validateAndEnrichOrderItems', async () => {
    await expect(posService.createOrder([])).rejects.toThrow('Order must contain at least one item');
    expect(posModel.createOrder).not.toHaveBeenCalled();
  });

  it('should propagate insufficient stock error', async () => {
    vi.mocked(posModel.getProductById).mockResolvedValue({ id: 1, productName: 'T-Shirt', price: 350, stock: 1 });

    await expect(posService.createOrder([{ product_id: 1, quantity: 5 }])).rejects.toThrow('Insufficient stock');
    expect(posModel.createOrder).not.toHaveBeenCalled();
  });
});

describe('posService - getTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return orders with default pagination', async () => {
    const mockOrders = [
      { id: 'TXN-001', totalAmount: 1000, createdAt: '2025-01-27T12:00:00Z', itemsCount: 3 },
    ];
    vi.mocked(posModel.getAllOrders).mockResolvedValue(mockOrders);

    const result = await posService.getTransactions();

    expect(posModel.getAllOrders).toHaveBeenCalledWith(50, 0);
    expect(result).toEqual(mockOrders);
  });

  it('should pass limit and offset to model', async () => {
    vi.mocked(posModel.getAllOrders).mockResolvedValue([]);

    await posService.getTransactions(25, 10);

    expect(posModel.getAllOrders).toHaveBeenCalledWith(25, 10);
  });

  it('should return empty array when no transactions exist', async () => {
    vi.mocked(posModel.getAllOrders).mockResolvedValue([]);

    const result = await posService.getTransactions();

    expect(result).toEqual([]);
  });
});

describe('posService - getOrderById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return order with items when found', async () => {
    const mockOrder = {
      orderId: 'TXN-001',
      totalAmount: 1000,
      createdAt: '2025-01-27T12:00:00.000Z',
      items: [
        { id: 1, productId: 1, productName: 'T-Shirt', quantity: 2, unitPrice: 350, subtotal: 700 },
      ],
    };
    vi.mocked(posModel.getOrderById).mockResolvedValue(mockOrder);

    const result = await posService.getOrderById('TXN-001');

    expect(posModel.getOrderById).toHaveBeenCalledWith('TXN-001');
    expect(result).toEqual(mockOrder);
  });

  it('should throw error when order not found', async () => {
    vi.mocked(posModel.getOrderById).mockResolvedValue(null);

    await expect(posService.getOrderById('TXN-999')).rejects.toThrow('Order not found with id: TXN-999');
  });

  it('should throw error when orderId is empty', async () => {
    await expect(posService.getOrderById('')).rejects.toThrow('Order ID is required');
  });

  it('should throw error when orderId is whitespace', async () => {
    await expect(posService.getOrderById('   ')).rejects.toThrow('Order ID is required');
  });

  it('should throw error when orderId is null', async () => {
    await expect(posService.getOrderById(null)).rejects.toThrow('Order ID is required');
  });
});

