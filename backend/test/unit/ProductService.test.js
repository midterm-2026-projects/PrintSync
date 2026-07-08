import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductService } from '../../services/ProductService.js';
import { ProductModel } from '../../models/ProductModel.js';

vi.mock('../../models/ProductModel.js', () => ({
  ProductModel: {
    validateItemStructure: vi.fn(() => true),
    getAllItems: vi.fn(),
    getItemById: vi.fn(),
    createItem: vi.fn(),
    updateStock: vi.fn()
  }
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProductService', () => {

  describe('formatItem()', () => {

    it('should format a product object correctly', () => {
      const item = {
        id: 1,
        name: ' Custom Mesh Jersey ',
        stock: 20
      };

      const result = ProductService.formatItem(item);

      expect(result).toEqual({
        itemId: '1',
        displayName: 'Custom Mesh Jersey',
        currentStock: 20,
        status: 'AVAILABLE',
        updatedAt: expect.any(String)
      });
    });

    it('should return LOW_STOCK status when stock is below 10', () => {
      const result = ProductService.formatItem({
        id: 2,
        name: 'Ink',
        stock: 5
      });

      expect(result.status).toBe('LOW_STOCK');
    });

  });

  describe('fetchAllProduct()', () => {

    it('should return formatted products from the model layer', async () => {
      const mockData = [
        { id: 1, name: 'Custom Mesh Jersey', stock: 50 },
        { id: 2, name: 'DTF Ink Cartridge', stock: 5 }
      ];

      vi.mocked(ProductModel.getAllItems).mockResolvedValue(mockData);

      const result = await ProductService.fetchAllProduct();

      expect(result).toHaveLength(2);
      expect(result[0].itemId).toBe('1');
      expect(result[1].status).toBe('LOW_STOCK');
    });

    it('should return an empty array when no products exist', async () => {
      vi.mocked(ProductModel.getAllItems).mockResolvedValue([]);

      const result = await ProductService.fetchAllProduct();

      expect(result).toEqual([]);
    });

  });

  describe('fetchProductById()', () => {

    it('should return a formatted product when a valid ID is provided', async () => {
      const item = {
        id: 99,
        name: ' Vinyl Sticker Pack ',
        stock: 12
      };

      vi.mocked(ProductModel.getItemById).mockResolvedValue(item);

      const result = await ProductService.fetchProductById(99);

      expect(ProductModel.getItemById).toHaveBeenCalledWith(99);
      expect(result.displayName).toBe('Vinyl Sticker Pack');
    });

    it('should return null when the product does not exist', async () => {
      vi.mocked(ProductModel.getItemById).mockResolvedValue(null);

      const result = await ProductService.fetchProductById(404);

      expect(result).toBeNull();
    });

    it('should throw an error when the product ID is null', async () => {
      await expect(
        ProductService.fetchProductById(null)
      ).rejects.toThrow('Invalid product ID provided');
    });

  });

  describe('addProduct()', () => {

    it('should create and return a formatted product', async () => {
      const payload = {
        id: 30,
        name: 'Glossy Photo Paper',
        stock: 100
      };

      vi.mocked(ProductModel.createItem).mockResolvedValue(payload);

      const result = await ProductService.addProduct(payload);

      expect(ProductModel.validateItemStructure)
        .toHaveBeenCalledWith(payload);

      expect(ProductModel.createItem)
        .toHaveBeenCalledWith(payload);

      expect(result.itemId).toBe('30');
    });

    it('should throw an error when the item name is empty', async () => {
      await expect(
        ProductService.addProduct({
          id: 31,
          name: '',
          stock: 10
        })
      ).rejects.toThrow('Item name is required');
    });

    it('should throw an error when the stock is negative', async () => {
      await expect(
        ProductService.addProduct({
          id: 31,
          name: 'Ink',
          stock: -1
        })
      ).rejects.toThrow('Negative stock numbers are rejected');
    });

  });

  describe('modifyStockCount()', () => {

    it('should update the stock quantity successfully', async () => {
      const updated = {
        id: 45,
        name: 'Heat Press Machine Pad',
        stock: 8
      };

      vi.mocked(ProductModel.updateStock).mockResolvedValue(updated);

      const result = await ProductService.modifyStockCount(45, 8);

      expect(ProductModel.updateStock)
        .toHaveBeenCalledWith(45, 8);

      expect(result.status).toBe('LOW_STOCK');
    });

    it('should throw an error when the ID is invalid', async () => {
      await expect(
        ProductService.modifyStockCount(null, 10)
      ).rejects.toThrow('Invalid product ID provided');
    });

    it('should throw an error when the stock is negative', async () => {
      await expect(
        ProductService.modifyStockCount(10, -5)
      ).rejects.toThrow('Negative stock numbers are rejected');
    });

    it('should throw an error when the stock is not an integer', async () => {
      await expect(
        ProductService.modifyStockCount(10, 5.5)
      ).rejects.toThrow('Stock must be an integer');
    });

  });

});