/**
 * InventoryModel.js
 * Database query functions for inventory management.
 */

import { pool } from '../db/pool.js';

export const InventoryModel = {
  /**
   * Get all inventory items with optional filtering and pagination.
   */
  async getAllItems(filters = {}) {
    const { category, limit = 100, offset = 0 } = filters;

    let query = `SELECT id, name, sku, category, stock, price, description, 
                        image_url, reorder_level, is_active, created_at, updated_at
                 FROM products
                 WHERE is_active = true`;
    const params = [];

    if (category) {
      query += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC 
              LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    return rows;
  },

  /**
   * Search items by name (case-insensitive).
   */
  async searchItems(searchQuery, filters = {}) {
    const { category, limit = 100, offset = 0 } = filters;

    let query = `SELECT id, name, sku, category, stock, price, description, 
                        image_url, reorder_level, is_active, created_at, updated_at
                 FROM products
                 WHERE is_active = true AND LOWER(name) LIKE LOWER($1)`;
    const params = [`%${searchQuery}%`];

    if (category) {
      query += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC 
              LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    return rows;
  },

  /**
   * Get single item by ID.
   */
  async getItemById(id) {
    if (id === undefined || id === null) {
      throw new Error('ID cannot be null');
    }

    const { rows } = await pool.query(
      `SELECT id, name, sku, category, stock, price, description, 
              image_url, reorder_level, is_active, created_at, updated_at
       FROM products
       WHERE id = $1 AND is_active = true
       LIMIT 1`,
      [id]
    );

    return rows[0] || null;
  },

  /**
   * Create new inventory item.
   */
  async createItem(itemData) {
    const { id, name, sku, category, stock, price, description, image_url, reorder_level } = itemData;

    if (!name || !name.trim()) {
      throw new Error('Item name is required');
    }
    if (stock === undefined || stock === null || stock < 0) {
      throw new Error('Stock must be a non-negative number');
    }
    if (price === undefined || price === null || price < 0) {
      throw new Error('Price must be a non-negative number');
    }
    if (!Number.isInteger(id)) {
      throw new Error('Product ID must be an integer');
    }

    const { rows } = await pool.query(
      `INSERT INTO products (id, name, sku, category, stock, price, description, image_url, reorder_level, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
       RETURNING id, name, sku, category, stock, price, description, image_url, reorder_level, is_active, created_at, updated_at`,
      [id, name, sku || null, category || null, stock, price, description || null, image_url || null, reorder_level || 0]
    );

    return rows[0];
  },

  /**
   * Update inventory item.
   */
  async updateItem(id, itemData) {
    if (id === undefined || id === null) {
      throw new Error('ID cannot be null');
    }

    const { name, sku, category, stock, price, description, image_url, reorder_level } = itemData;

    // Build dynamic UPDATE query based on provided fields
    const updates = [];
    const params = [id];
    let paramCount = 1;

    if (name !== undefined) {
      if (!name || !name.trim()) throw new Error('Item name cannot be empty');
      paramCount++;
      updates.push(`name = $${paramCount}`);
      params.push(name);
    }
    if (sku !== undefined) {
      paramCount++;
      updates.push(`sku = $${paramCount}`);
      params.push(sku || null);
    }
    if (category !== undefined) {
      paramCount++;
      updates.push(`category = $${paramCount}`);
      params.push(category || null);
    }
    if (stock !== undefined) {
      if (stock < 0) throw new Error('Stock cannot be negative');
      paramCount++;
      updates.push(`stock = $${paramCount}`);
      params.push(stock);
    }
    if (price !== undefined) {
      if (price < 0) throw new Error('Price cannot be negative');
      paramCount++;
      updates.push(`price = $${paramCount}`);
      params.push(price);
    }
    if (description !== undefined) {
      paramCount++;
      updates.push(`description = $${paramCount}`);
      params.push(description || null);
    }
    if (image_url !== undefined) {
      paramCount++;
      updates.push(`image_url = $${paramCount}`);
      params.push(image_url || null);
    }
    if (reorder_level !== undefined) {
      paramCount++;
      updates.push(`reorder_level = $${paramCount}`);
      params.push(reorder_level || 0);
    }

    if (updates.length === 0) {
      throw new Error('No fields provided to update');
    }

    paramCount++;
    updates.push(`updated_at = NOW()`);

    const query = `UPDATE products
                   SET ${updates.join(', ')}
                   WHERE id = $1 AND is_active = true
                   RETURNING id, name, sku, category, stock, price, description, image_url, reorder_level, is_active, created_at, updated_at`;

    const { rows } = await pool.query(query, params);

    if (rows.length === 0) return null;
    return rows[0];
  },

  /**
   * Soft delete item (set is_active = false).
   */
  async deleteItem(id) {
    if (id === undefined || id === null) {
      throw new Error('ID cannot be null');
    }

    const { rows } = await pool.query(
      `UPDATE products
       SET is_active = false, updated_at = NOW()
       WHERE id = $1 AND is_active = true
       RETURNING id, name, sku, category, stock, price, description, image_url, reorder_level, is_active, created_at, updated_at`,
      [id]
    );

    return rows[0] || null;
  },

  /**
   * Adjust stock and create an audit entry.
   */
  async adjustStock(productId, delta, reason, performedBy) {
    if (productId === undefined || productId === null) {
      throw new Error('Product ID cannot be null');
    }
    if (!Number.isInteger(delta)) {
      throw new Error('Delta must be an integer');
    }

    // Get current product
    const product = await this.getItemById(productId);
    if (!product) {
      throw new Error(`Product not found for id ${productId}`);
    }

    const newStock = product.stock + delta;
    if (newStock < 0) {
      throw new Error(`Insufficient stock. Current: ${product.stock}, Requested: ${Math.abs(delta)}`);
    }

    // Update stock
    const { rows: updatedRows } = await pool.query(
      `UPDATE products
       SET stock = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, stock, updated_at`,
      [productId, newStock]
    );

    // Create stock movement audit record
    await pool.query(
      `INSERT INTO stock_movements (product_id, delta, reason, performed_by)
       VALUES ($1, $2, $3, $4)`,
      [productId, delta, reason || null, performedBy || null]
    );

    return updatedRows[0];
  },

  /**
   * Get stock movement history for a product.
   */
  async getStockMovements(productId, limit = 50) {
    if (productId === undefined || productId === null) {
      throw new Error('Product ID cannot be null');
    }

    const { rows } = await pool.query(
      `SELECT id, product_id, delta, reason, performed_by, created_at
       FROM stock_movements
       WHERE product_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [productId, limit]
    );

    return rows;
  },

  /**
   * Get all designs for DesignGallery component.
   */
  async getDesigns(limit = 100, offset = 0) {
    const { rows } = await pool.query(
      `SELECT id, title, url, product_id, uploaded_by, created_at
       FROM designs
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return rows;
  },

  /**
   * Create design/image entry.
   */
  async createDesign(designData) {
    const { title, url, product_id, uploaded_by } = designData;

    if (!title || !title.trim()) {
      throw new Error('Design title is required');
    }
    if (!url || !url.trim()) {
      throw new Error('Design URL is required');
    }

    const { rows } = await pool.query(
      `INSERT INTO designs (title, url, product_id, uploaded_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, url, product_id, uploaded_by, created_at`,
      [title, url, product_id || null, uploaded_by || null]
    );

    return rows[0];
  },

  /**
   * Delete design entry.
   */
  async deleteDesign(designId) {
    if (designId === undefined || designId === null) {
      throw new Error('Design ID cannot be null');
    }

    const { rows } = await pool.query(
      `DELETE FROM designs
       WHERE id = $1
       RETURNING id, title, url, product_id`,
      [designId]
    );

    return rows[0] || null;
  },
};
