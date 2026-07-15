/**
 * InventoryController.js
 * Request handlers for inventory endpoints.
 */

import { InventoryService } from '../services/InventoryService.js';

/**
 * GET /items - List or search items
 * Query params: q (search), category, limit, offset
 */
export async function getItems(req, res) {
  try {
    const { q = '', category = null, limit = 100, offset = 0 } = req.query;

    const items = await InventoryService.getItems(q, category, Number(limit), Number(offset));

    return res.status(200).json({
      ok: true,
      items,
      count: items.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ ok: false, error: message });
  }
}

/**
 * GET /items/:id - Get single item by ID
 */
export async function getItemById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ ok: false, error: 'Item ID is required' });
    }

    const item = await InventoryService.getItemById(id);

    return res.status(200).json({
      ok: true,
      item,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const statusCode = message.includes('not found') ? 404 : 500;
    return res.status(statusCode).json({ ok: false, error: message });
  }
}

/**
 * POST /items - Create new item
 */
export async function createItem(req, res) {
  try {
    const { name, sku, category, stock, price, description, image_url, reorder_level } = req.body;

    const item = await InventoryService.createItem({
      name,
      sku,
      category,
      stock,
      price,
      description,
      image_url,
      reorder_level,
    });

    return res.status(201).json({
      ok: true,
      item,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(400).json({ ok: false, error: message });
  }
}

/**
 * PUT /items/:id - Update item
 */
export async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const { name, sku, category, stock, price, description, image_url, reorder_level } = req.body;

    if (!id) {
      return res.status(400).json({ ok: false, error: 'Item ID is required' });
    }

    const item = await InventoryService.updateItem(id, {
      name,
      sku,
      category,
      stock,
      price,
      description,
      image_url,
      reorder_level,
    });

    return res.status(200).json({
      ok: true,
      item,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const statusCode = message.includes('not found') ? 404 : 400;
    return res.status(statusCode).json({ ok: false, error: message });
  }
}

/**
 * DELETE /items/:id - Delete (soft delete) item
 */
export async function deleteItem(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ ok: false, error: 'Item ID is required' });
    }

    await InventoryService.deleteItem(id);

    return res.status(200).json({
      ok: true,
      message: 'Item deleted successfully',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const statusCode = message.includes('not found') ? 404 : 500;
    return res.status(statusCode).json({ ok: false, error: message });
  }
}

/**
 * PATCH /items/:id/stock - Adjust stock and create audit entry
 * Body: { delta, reason?, performed_by? }
 */
export async function adjustStock(req, res) {
  try {
    const { id } = req.params;
    const { delta, reason, performed_by } = req.body;

    if (!id) {
      return res.status(400).json({ ok: false, error: 'Item ID is required' });
    }
    if (delta === undefined || delta === null) {
      return res.status(400).json({ ok: false, error: 'Delta is required' });
    }

    const item = await InventoryService.adjustStock(id, Number(delta), reason, performed_by);

    return res.status(200).json({
      ok: true,
      item,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const statusCode = message.includes('not found') ? 404 : 400;
    return res.status(statusCode).json({ ok: false, error: message });
  }
}

/**
 * GET /items/:id/stock-history - Get stock movement history for item
 * Query params: limit
 */
export async function getStockHistory(req, res) {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    if (!id) {
      return res.status(400).json({ ok: false, error: 'Item ID is required' });
    }

    const history = await InventoryService.getStockHistory(id, Number(limit));

    return res.status(200).json({
      ok: true,
      history,
      count: history.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const statusCode = message.includes('not found') ? 404 : 500;
    return res.status(statusCode).json({ ok: false, error: message });
  }
}

/**
 * GET /designs - List all designs for gallery
 * Query params: limit, offset
 */
export async function getDesigns(req, res) {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const designs = await InventoryService.getDesigns(Number(limit), Number(offset));

    return res.status(200).json({
      ok: true,
      designs,
      count: designs.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ ok: false, error: message });
  }
}

/**
 * POST /designs - Create design entry
 */
export async function createDesign(req, res) {
  try {
    const { title, url, product_id, uploaded_by } = req.body;

    const design = await InventoryService.createDesign({
      title,
      url,
      product_id,
      uploaded_by,
    });

    return res.status(201).json({
      ok: true,
      design,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(400).json({ ok: false, error: message });
  }
}

/**
 * DELETE /designs/:id - Delete design entry
 */
export async function deleteDesign(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ ok: false, error: 'Design ID is required' });
    }

    await InventoryService.deleteDesign(id);

    return res.status(200).json({
      ok: true,
      message: 'Design deleted successfully',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const statusCode = message.includes('not found') ? 404 : 500;
    return res.status(statusCode).json({ ok: false, error: message });
  }
}
