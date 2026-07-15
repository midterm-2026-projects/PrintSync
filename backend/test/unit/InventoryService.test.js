import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../models/InventoryModel.js', () => {
  return {
    InventoryModel: {
      getAllItems: vi.fn(),
      searchItems: vi.fn(),
      getItemById: vi.fn(),
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      getDesigns: vi.fn(),
      createDesign: vi.fn(),
      deleteDesign: vi.fn(),
    },
  };
});

import { InventoryService } from '../../services/InventoryService.js';
import { InventoryModel } from '../../models/InventoryModel.js';

describe('InventoryService - getItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call getAllItems when no search query is provided', async () => {
    const mockItems = [
      { id: 1, name: 'T-Shirt', category: 'Garment', stock: 50, price: 350 },
      { id: 2, name: 'Ink', category: 'Material', stock: 100, price: 500 },
    ];
    vi.mocked(InventoryModel.getAllItems).mockResolvedValue(mockItems);

    const result = await InventoryService.getItems('', null, 100, 0);

    expect(InventoryModel.getAllItems).toHaveBeenCalledWith({ category: null, limit: 100, offset: 0 });
    expect(result).toEqual(mockItems);
  });

  it('should call searchItems when search query is provided', async () => {
    const mockItems = [{ id: 1, name: 'T-Shirt', category: 'Garment', stock: 50, price: 350 }];
    vi.mocked(InventoryModel.searchItems).mockResolvedValue(mockItems);

    const result = await InventoryService.getItems('T-Shirt', null, 100, 0);

    expect(InventoryModel.searchItems).toHaveBeenCalledWith('T-Shirt', { category: null, limit: 100, offset: 0 });
    expect(result).toEqual(mockItems);
  });

  it('should pass category filter to getAllItems', async () => {
    vi.mocked(InventoryModel.getAllItems).mockResolvedValue([]);

    await InventoryService.getItems('', 'Garment', 50, 10);

    expect(InventoryModel.getAllItems).toHaveBeenCalledWith({ category: 'Garment', limit: 50, offset: 10 });
  });

  it('should pass category filter to searchItems', async () => {
    vi.mocked(InventoryModel.searchItems).mockResolvedValue([]);

    await InventoryService.getItems('Shirt', 'Material', 25, 5);

    expect(InventoryModel.searchItems).toHaveBeenCalledWith('Shirt', { category: 'Material', limit: 25, offset: 5 });
  });

  it('should return empty array when no items match', async () => {
    vi.mocked(InventoryModel.getAllItems).mockResolvedValue([]);

    const result = await InventoryService.getItems('', null, 100, 0);

    expect(result).toEqual([]);
  });
});

describe('InventoryService - getItemById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return item when found', async () => {
    const mockItem = { id: 1, name: 'T-Shirt', category: 'Garment', stock: 50, price: 350 };
    vi.mocked(InventoryModel.getItemById).mockResolvedValue(mockItem);

    const result = await InventoryService.getItemById(1);

    expect(InventoryModel.getItemById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockItem);
  });

  it('should throw error when item not found', async () => {
    vi.mocked(InventoryModel.getItemById).mockResolvedValue(null);

    await expect(InventoryService.getItemById(999)).rejects.toThrow('Item not found with id: 999');
  });

  it('should pass ID correctly to model', async () => {
    const mockItem = { id: 42, name: 'Vinyl', category: null, stock: 200, price: 50 };
    vi.mocked(InventoryModel.getItemById).mockResolvedValue(mockItem);

    const result = await InventoryService.getItemById(42);

    expect(InventoryModel.getItemById).toHaveBeenCalledWith(42);
    expect(result.id).toBe(42);
  });
});

describe('InventoryService - createItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create item with all valid fields', async () => {
    const mockCreated = {
      id: 1,
      name: 'Premium T-Shirt',
      sku: 'TSH-001',
      category: 'Garment',
      stock: 50,
      price: 350,
      description: 'High-quality cotton',
      image_url: 'https://example.com/img.jpg',
      reorder_level: 10,
    };
    vi.mocked(InventoryModel.createItem).mockResolvedValue(mockCreated);

    const result = await InventoryService.createItem({
      name: 'Premium T-Shirt',
      sku: 'TSH-001',
      category: 'Garment',
      stock: 50,
      price: 350,
      description: 'High-quality cotton',
      image_url: 'https://example.com/img.jpg',
      reorder_level: 10,
    });

    expect(InventoryModel.createItem).toHaveBeenCalled();
    expect(result).toEqual(mockCreated);
  });

  it('should create item with minimal required fields', async () => {
    const mockCreated = { id: 2, name: 'Ink', stock: 100, price: 500 };
    vi.mocked(InventoryModel.createItem).mockResolvedValue(mockCreated);

    const result = await InventoryService.createItem({
      name: 'Ink',
      stock: 100,
      price: 500,
    });

    expect(result).toEqual(mockCreated);
  });

  it('should throw error if name is empty', async () => {
    await expect(
      InventoryService.createItem({
        name: '',
        stock: 50,
        price: 350,
      })
    ).rejects.toThrow('Item name is required');

    expect(InventoryModel.createItem).not.toHaveBeenCalled();
  });

  it('should throw error if name is whitespace only', async () => {
    await expect(
      InventoryService.createItem({
        name: '   ',
        stock: 50,
        price: 350,
      })
    ).rejects.toThrow('Item name is required');
  });

  it('should throw error if stock is negative', async () => {
    await expect(
      InventoryService.createItem({
        name: 'Item',
        stock: -5,
        price: 350,
      })
    ).rejects.toThrow('Stock cannot be negative');

    expect(InventoryModel.createItem).not.toHaveBeenCalled();
  });

  it('should throw error if stock is not provided', async () => {
    await expect(
      InventoryService.createItem({
        name: 'Item',
        price: 350,
      })
    ).rejects.toThrow('Stock is required');
  });

  it('should throw error if price is negative', async () => {
    await expect(
      InventoryService.createItem({
        name: 'Item',
        stock: 50,
        price: -10,
      })
    ).rejects.toThrow('Price cannot be negative');

    expect(InventoryModel.createItem).not.toHaveBeenCalled();
  });

  it('should throw error if price is not provided', async () => {
    await expect(
      InventoryService.createItem({
        name: 'Item',
        stock: 50,
      })
    ).rejects.toThrow('Price is required');
  });

  it('should trim whitespace from name', async () => {
    const mockCreated = { id: 3, name: 'Trimmed Item', stock: 50, price: 350 };
    vi.mocked(InventoryModel.createItem).mockResolvedValue(mockCreated);

    await InventoryService.createItem({
      name: '  Trimmed Item  ',
      stock: 50,
      price: 350,
    });

    const callArgs = vi.mocked(InventoryModel.createItem).mock.calls[0][0];
    expect(callArgs.name).toBe('Trimmed Item');
  });

  it('should convert stock and price to numbers', async () => {
    vi.mocked(InventoryModel.createItem).mockResolvedValue({ id: 4 });

    await InventoryService.createItem({
      name: 'Item',
      stock: '50',
      price: '350.50',
    });

    const callArgs = vi.mocked(InventoryModel.createItem).mock.calls[0][0];
    expect(typeof callArgs.stock).toBe('number');
    expect(typeof callArgs.price).toBe('number');
  });

  it('should allow zero stock', async () => {
    const mockCreated = { id: 5, name: 'Item', stock: 0, price: 100 };
    vi.mocked(InventoryModel.createItem).mockResolvedValue(mockCreated);

    const result = await InventoryService.createItem({
      name: 'Item',
      stock: 0,
      price: 100,
    });

    expect(result.stock).toBe(0);
  });

  it('should allow zero price', async () => {
    const mockCreated = { id: 6, name: 'Freebie', stock: 10, price: 0 };
    vi.mocked(InventoryModel.createItem).mockResolvedValue(mockCreated);

    const result = await InventoryService.createItem({
      name: 'Freebie',
      stock: 10,
      price: 0,
    });

    expect(result.price).toBe(0);
  });
});

describe('InventoryService - updateItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update item with valid data', async () => {
    const mockExisting = { id: 1, name: 'Old Name', stock: 50, price: 350 };
    const mockUpdated = { id: 1, name: 'New Name', stock: 75, price: 400 };

    vi.mocked(InventoryModel.getItemById).mockResolvedValue(mockExisting);
    vi.mocked(InventoryModel.updateItem).mockResolvedValue(mockUpdated);

    const result = await InventoryService.updateItem(1, {
      name: 'New Name',
      stock: 75,
      price: 400,
    });

    expect(InventoryModel.updateItem).toHaveBeenCalled();
    expect(result).toEqual(mockUpdated);
  });

  it('should throw error if item does not exist', async () => {
    vi.mocked(InventoryModel.getItemById).mockResolvedValue(null);

    await expect(
      InventoryService.updateItem(999, { name: 'New Name' })
    ).rejects.toThrow('Item not found with id: 999');

    expect(InventoryModel.updateItem).not.toHaveBeenCalled();
  });

  it('should throw error if name is provided but empty', async () => {
    const mockExisting = { id: 1, name: 'Existing' };
    vi.mocked(InventoryModel.getItemById).mockResolvedValue(mockExisting);

    await expect(
      InventoryService.updateItem(1, { name: '' })
    ).rejects.toThrow('Item name cannot be empty');

    expect(InventoryModel.updateItem).not.toHaveBeenCalled();
  });

  it('should throw error if stock is negative', async () => {
    const mockExisting = { id: 1 };
    vi.mocked(InventoryModel.getItemById).mockResolvedValue(mockExisting);

    await expect(
      InventoryService.updateItem(1, { stock: -5 })
    ).rejects.toThrow('Stock cannot be negative');

    expect(InventoryModel.updateItem).not.toHaveBeenCalled();
  });

  it('should throw error if price is negative', async () => {
    const mockExisting = { id: 1 };
    vi.mocked(InventoryModel.getItemById).mockResolvedValue(mockExisting);

    await expect(
      InventoryService.updateItem(1, { price: -10 })
    ).rejects.toThrow('Price cannot be negative');

    expect(InventoryModel.updateItem).not.toHaveBeenCalled();
  });

  it('should allow partial updates', async () => {
    const mockExisting = { id: 1, name: 'Item', stock: 50, price: 350 };
    const mockUpdated = { id: 1, name: 'Item', stock: 100, price: 350 };

    vi.mocked(InventoryModel.getItemById).mockResolvedValue(mockExisting);
    vi.mocked(InventoryModel.updateItem).mockResolvedValue(mockUpdated);

    const result = await InventoryService.updateItem(1, { stock: 100 });

    expect(result.stock).toBe(100);
  });

  it('should trim whitespace from name if provided', async () => {
    const mockExisting = { id: 1 };
    vi.mocked(InventoryModel.getItemById).mockResolvedValue(mockExisting);
    vi.mocked(InventoryModel.updateItem).mockResolvedValue({ id: 1 });

    await InventoryService.updateItem(1, { name: '  New Name  ' });

    const callArgs = vi.mocked(InventoryModel.updateItem).mock.calls[0][1];
    expect(callArgs.name).toBe('New Name');
  });

  it('should convert stock and price to numbers', async () => {
    const mockExisting = { id: 1 };
    vi.mocked(InventoryModel.getItemById).mockResolvedValue(mockExisting);
    vi.mocked(InventoryModel.updateItem).mockResolvedValue({ id: 1 });

    await InventoryService.updateItem(1, { stock: '75', price: '400.50' });

    const callArgs = vi.mocked(InventoryModel.updateItem).mock.calls[0][1];
    expect(typeof callArgs.stock).toBe('number');
    expect(typeof callArgs.price).toBe('number');
  });

  it('should allow zero values for stock and price', async () => {
    const mockExisting = { id: 1 };
    vi.mocked(InventoryModel.getItemById).mockResolvedValue(mockExisting);
    vi.mocked(InventoryModel.updateItem).mockResolvedValue({ id: 1, stock: 0, price: 0 });

    const result = await InventoryService.updateItem(1, { stock: 0, price: 0 });

    expect(result.stock).toBe(0);
    expect(result.price).toBe(0);
  });
});

describe('InventoryService - deleteItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete item when it exists', async () => {
    const mockItem = { id: 1, name: 'Item to Delete' };
    vi.mocked(InventoryModel.getItemById).mockResolvedValue(mockItem);
    vi.mocked(InventoryModel.deleteItem).mockResolvedValue(mockItem);

    const result = await InventoryService.deleteItem(1);

    expect(InventoryModel.deleteItem).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockItem);
  });

  it('should throw error if item does not exist', async () => {
    vi.mocked(InventoryModel.getItemById).mockResolvedValue(null);

    await expect(InventoryService.deleteItem(999)).rejects.toThrow('Item not found with id: 999');

    expect(InventoryModel.deleteItem).not.toHaveBeenCalled();
  });

  it('should throw error if delete fails', async () => {
    const mockItem = { id: 1 };
    vi.mocked(InventoryModel.getItemById).mockResolvedValue(mockItem);
    vi.mocked(InventoryModel.deleteItem).mockResolvedValue(null);

    await expect(InventoryService.deleteItem(1)).rejects.toThrow('Failed to delete item with id: 1');
  });
});

describe('InventoryService - getDesigns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all designs with default pagination', async () => {
    const mockDesigns = [
      { id: 1, title: 'Design A', url: 'http://example.com/a.jpg' },
      { id: 2, title: 'Design B', url: 'http://example.com/b.jpg' },
    ];
    vi.mocked(InventoryModel.getDesigns).mockResolvedValue(mockDesigns);

    const result = await InventoryService.getDesigns();

    expect(InventoryModel.getDesigns).toHaveBeenCalledWith(100, 0);
    expect(result).toEqual(mockDesigns);
  });

  it('should pass limit and offset to model', async () => {
    vi.mocked(InventoryModel.getDesigns).mockResolvedValue([]);

    await InventoryService.getDesigns(25, 50);

    expect(InventoryModel.getDesigns).toHaveBeenCalledWith(25, 50);
  });

  it('should return empty array when no designs exist', async () => {
    vi.mocked(InventoryModel.getDesigns).mockResolvedValue([]);

    const result = await InventoryService.getDesigns();

    expect(result).toEqual([]);
  });
});

describe('InventoryService - createDesign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create design with required fields', async () => {
    const mockDesign = {
      id: 1,
      title: 'New Design',
      url: 'https://example.com/design.jpg',
      product_id: null,
      uploaded_by: null,
      created_at: '2025-07-15T10:00:00Z',
    };
    vi.mocked(InventoryModel.createDesign).mockResolvedValue(mockDesign);

    const result = await InventoryService.createDesign({
      title: 'New Design',
      url: 'https://example.com/design.jpg',
    });

    expect(InventoryModel.createDesign).toHaveBeenCalled();
    expect(result).toEqual(mockDesign);
  });

  it('should create design with optional fields', async () => {
    const mockDesign = {
      id: 2,
      title: 'Design with Product',
      url: 'https://example.com/design.jpg',
      product_id: 1,
      uploaded_by: 'admin',
      created_at: '2025-07-15T10:00:00Z',
    };
    vi.mocked(InventoryModel.createDesign).mockResolvedValue(mockDesign);

    const result = await InventoryService.createDesign({
      title: 'Design with Product',
      url: 'https://example.com/design.jpg',
      product_id: 1,
      uploaded_by: 'admin',
    });

    expect(result).toEqual(mockDesign);
  });

  it('should throw error if title is empty', async () => {
    await expect(
      InventoryService.createDesign({
        title: '',
        url: 'https://example.com/design.jpg',
      })
    ).rejects.toThrow('Design title is required');

    expect(InventoryModel.createDesign).not.toHaveBeenCalled();
  });

  it('should throw error if title is whitespace only', async () => {
    await expect(
      InventoryService.createDesign({
        title: '   ',
        url: 'https://example.com/design.jpg',
      })
    ).rejects.toThrow('Design title is required');
  });

  it('should throw error if URL is empty', async () => {
    await expect(
      InventoryService.createDesign({
        title: 'Design',
        url: '',
      })
    ).rejects.toThrow('Design URL is required');

    expect(InventoryModel.createDesign).not.toHaveBeenCalled();
  });

  it('should throw error if URL is whitespace only', async () => {
    await expect(
      InventoryService.createDesign({
        title: 'Design',
        url: '   ',
      })
    ).rejects.toThrow('Design URL is required');
  });

  it('should trim whitespace from title and URL', async () => {
    vi.mocked(InventoryModel.createDesign).mockResolvedValue({ id: 1 });

    await InventoryService.createDesign({
      title: '  Design Title  ',
      url: '  https://example.com/design.jpg  ',
    });

    const callArgs = vi.mocked(InventoryModel.createDesign).mock.calls[0][0];
    expect(callArgs.title).toBe('Design Title');
    expect(callArgs.url).toBe('https://example.com/design.jpg');
  });
});

describe('InventoryService - deleteDesign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete design when it exists', async () => {
    const mockDesign = { id: 1, title: 'Design to Delete' };
    vi.mocked(InventoryModel.deleteDesign).mockResolvedValue(mockDesign);

    const result = await InventoryService.deleteDesign(1);

    expect(InventoryModel.deleteDesign).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockDesign);
  });

  it('should throw error if design does not exist', async () => {
    vi.mocked(InventoryModel.deleteDesign).mockResolvedValue(null);

    await expect(InventoryService.deleteDesign(999)).rejects.toThrow('Design not found with id: 999');
  });

  it('should throw error for invalid design ID', async () => {
    await expect(InventoryService.deleteDesign(null)).rejects.toThrow();
  });
});
