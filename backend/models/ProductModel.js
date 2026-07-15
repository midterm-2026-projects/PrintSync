/**
 * ProductModel.js
 * Contains core validation schemas/helpers and placeholder database query functions.
 * Does not implement actual database connectivity (Supabase, MySQL, etc.).
 */

import { pool } from '../db/pool.js';

export const ProductModel = {
  // Client-side/Model validation helpers
  validateItemStructure(item) {
    if (!item || typeof item !== 'object') {
      throw new Error('Invalid product object provided');
    }
    if (item.id === undefined || item.id === null) {
      throw new Error('ID cannot be null');
    }
    if (!Number.isInteger(item.stock)) {
      throw new Error('Stock must be an integer');
    }
    return true;
  },

  // DB methods
  async getAllItems() {
    const { rows } = await pool.query(
      `SELECT id, name, stock, updated_at
       FROM products
       ORDER BY id ASC`
    );
    return rows;
  },

  async getItemById(id) {
    if (id === undefined || id === null) throw new Error('ID cannot be null');

    const { rows } = await pool.query(
      `SELECT id, name, stock, updated_at
       FROM products
       WHERE id = $1
       LIMIT 1`,
      [id]
    );

    return rows[0] || null;
  },


  async createItem(item) {
    this.validateItemStructure(item);

    const { id, name, stock } = item;

    const { rows } = await pool.query(
      `INSERT INTO products (id, name, stock)
       VALUES ($1, $2, $3)
       RETURNING id, name, stock, updated_at`,
      [id, name, stock]
    );

    return rows[0];
  },

  // updateStock(id, quantity) semantics: set stock to the provided quantity
  async updateStock(id, quantity) {
    if (id === undefined || id === null) throw new Error('ID cannot be null');
    if (!Number.isInteger(quantity)) throw new Error('Stock must be an integer');

    const { rows } = await pool.query(
      `UPDATE products
       SET stock = $2,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, stock, updated_at`,
      [id, quantity]
    );

    if (rows.length === 0) return null;
    return rows[0];
  }
};
