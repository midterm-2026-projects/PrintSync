/**
 * InventoryService.js
 * Business logic for inventory management.
 */

import { InventoryModel } from '../models/InventoryModel.js';

/**
 * Generate an ID for a newly created inventory product.
 * Product creation is service-layer business logic, so the model receives the
 * final data it should persist instead of generating identifiers itself.
 */
const generateProductId = () => Math.floor(1_000_000 + Math.random() * 8_999_999);

export const InventoryService = {
  /**
   * Retrieve all items or search by name with optional category filter.
   */
  async getItems(query = '', category = null, limit = 100, offset = 0) {
    if (query && query.trim()) {
      return await InventoryModel.searchItems(query, { category, limit, offset });
    }
    return await InventoryModel.getAllItems({ category, limit, offset });
  },

  /**
   * Get single item.
   */
  async getItemById(id) {
    const item = await InventoryModel.getItemById(id);
    if (!item) {
      throw new Error(`Item not found with id: ${id}`);
    }
    return item;
  },

  /**
   * Create new item with validation.
   */
  async createItem(itemData) {
    const { name, stock, price, sku, category, description, image_url, reorder_level } = itemData;

    if (!name || !name.trim()) {
      throw new Error('Item name is required');
    }
    if (stock === undefined || stock === null) {
      throw new Error('Stock is required');
    }
    if (stock < 0) {
      throw new Error('Stock cannot be negative');
    }
    if (price === undefined || price === null) {
      throw new Error('Price is required');
    }
    if (price < 0) {
      throw new Error('Price cannot be negative');
    }

    return await InventoryModel.createItem({
      id: generateProductId(),
      name: name.trim(),
      stock: Number(stock),
      price: Number(price),
      sku: sku || null,
      category: category || null,
      description: description || null,
      image_url: image_url || null,
      reorder_level: reorder_level || 0,
    });
  },

  /**
   * Update existing item.
   */
  async updateItem(id, itemData) {
    // Validate item exists
    await this.getItemById(id);

    // Validate fields if provided
    if (itemData.name !== undefined && (!itemData.name || !itemData.name.trim())) {
      throw new Error('Item name cannot be empty');
    }
    if (itemData.stock !== undefined && itemData.stock < 0) {
      throw new Error('Stock cannot be negative');
    }
    if (itemData.price !== undefined && itemData.price < 0) {
      throw new Error('Price cannot be negative');
    }

    const cleanedData = {
      ...itemData,
      ...(itemData.name && { name: itemData.name.trim() }),
      ...(itemData.stock !== undefined && { stock: Number(itemData.stock) }),
      ...(itemData.price !== undefined && { price: Number(itemData.price) }),
    };

    const updated = await InventoryModel.updateItem(id, cleanedData);
    if (!updated) {
      throw new Error(`Failed to update item with id: ${id}`);
    }

    return updated;
  },

  /**
   * Delete item (soft delete).
   */
  async deleteItem(id) {
    await this.getItemById(id);
    const deleted = await InventoryModel.deleteItem(id);
    if (!deleted) {
      throw new Error(`Failed to delete item with id: ${id}`);
    }
    return deleted;
  },

  /**
   * Adjust stock with audit trail.
   */
  async adjustStock(productId, delta, reason, performedBy) {
    if (!Number.isInteger(delta)) {
      throw new Error('Delta must be an integer');
    }
    if (delta === 0) {
      throw new Error('Delta cannot be zero');
    }

    return await InventoryModel.adjustStock(productId, delta, reason, performedBy);
  },

  /**
   * Get stock history for a product.
   */
  async getStockHistory(productId, limit = 50) {
    await this.getItemById(productId); // Validate product exists
    return await InventoryModel.getStockMovements(productId, limit);
  },

  /**
   * Get all designs for gallery.
   */
  async getDesigns(limit = 100, offset = 0) {
    return await InventoryModel.getDesigns(limit, offset);
  },

  /**
   * Create design entry.
   */
  async createDesign(designData) {
    const { title, url, product_id, uploaded_by } = designData;

    if (!title || !title.trim()) {
      throw new Error('Design title is required');
    }
    if (!url || !url.trim()) {
      throw new Error('Design URL is required');
    }

    return await InventoryModel.createDesign({
      title: title.trim(),
      url: url.trim(),
      product_id: product_id || null,
      uploaded_by: uploaded_by || null,
    });
  },

  /**
   * Delete design entry.
   */
  async deleteDesign(designId) {
    const deleted = await InventoryModel.deleteDesign(designId);
    if (!deleted) {
      throw new Error(`Design not found with id: ${designId}`);
    }
    return deleted;
  },
};
