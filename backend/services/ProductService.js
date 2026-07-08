/**
 * ProductService.js
 * Implements core business logic, sanitization, and data formatting.
 * Interacts with the data layer via the imported ProductModel object.
 */
import { ProductModel } from '../models/ProductModel.js';

export const ProductService = {
  /**
   * Standardized formatter utility for product items
   */
  formatItem(item) {
    return {
      itemId: String(item.id),
      displayName: item.name ? item.name.trim() : 'Unnamed Item',
      currentStock: item.stock,
      status: item.stock < 10 ? 'LOW_STOCK' : 'AVAILABLE',
      updatedAt: new Date().toISOString()
    };
  },

  async fetchAllProduct() {
    const items = await ProductModel.getAllItems();
    if (!items || items.length === 0) {
      return [];
    }
    return items.map(this.formatItem);
  },

  async fetchProductById(id) {
    if (id === undefined || id === null) {
      throw new Error('Invalid product ID provided');
    }
    
    const item = await ProductModel.getItemById(id);
    if (!item) return null;
    
    return this.formatItem(item);
  },

  async addProduct(itemData) {
    if (!itemData.name || itemData.name.trim() === '') {
      throw new Error('Item name is required');
    }
    if (itemData.stock < 0) {
      throw new Error('Negative stock numbers are rejected');
    }

    // Pass data through base model checks
    ProductModel.validateItemStructure(itemData);

    const savedItem = await ProductModel.createItem(itemData);
    return this.formatItem(savedItem);
  },

  async modifyStockCount(id, quantity) {
    if (id === undefined || id === null) {
      throw new Error('Invalid product ID provided');
    }
    if (quantity < 0) {
      throw new Error('Negative stock numbers are rejected');
    }
    if (!Number.isInteger(quantity)) {
      throw new Error('Stock must be an integer');
    }

    const updatedItem = await ProductModel.updateStock(id, quantity);
    return this.formatItem(updatedItem);
  }
};