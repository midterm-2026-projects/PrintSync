import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load backend/.env explicitly (cwd-independent)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Dynamic imports so dotenv is applied before pool.js is evaluated
let InventoryModel;
let pool;

beforeAll(async () => {
  const inventoryModelMod = await import('../../models/InventoryModel.js');
  InventoryModel = inventoryModelMod.InventoryModel;

  const poolMod = await import('../../db/pool.js');
  pool = poolMod.pool;
});

afterAll(async () => {
  try {
    if (pool) await pool.end();
  } catch {}
});

// Helper: generate unique ID for test data
function randId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function productId() {
  return Math.floor(1_000_000 + Math.random() * 8_999_999);
}

// Helper: create and cleanup test item
async function withTestItem(itemData, fn) {
  const item = await InventoryModel.createItem({
    id: productId(),
    name: itemData.name || `test-item-${randId('item')}`,
    sku: itemData.sku || `SKU-${randId('sku')}`,
    category: itemData.category || 'Test',
    stock: itemData.stock || 100,
    price: itemData.price || 500,
    description: itemData.description || 'Test item',
    image_url: itemData.image_url || null,
    reorder_level: itemData.reorder_level || 0,
  });

  try {
    return await fn(item);
  } finally {
    try {
      await pool.query('DELETE FROM public.products WHERE id = $1', [item.id]);
    } catch {}
  }
}

// Helper: create and cleanup test design
async function withTestDesign(designData, fn) {
  const design = await InventoryModel.createDesign({
    title: designData.title || `test-design-${randId('design')}`,
    url: designData.url || `https://example.com/${randId('design')}.jpg`,
    product_id: designData.product_id || null,
    uploaded_by: designData.uploaded_by || 'test-user',
  });

  try {
    return await fn(design);
  } finally {
    try {
      await pool.query('DELETE FROM public.designs WHERE id = $1', [design.id]);
    } catch {}
  }
}

describe('InventoryModel - getAllItems', () => {
  beforeEach(() => {
    vi.clearAllMocks?.();
  });

  it('should retrieve all active items from database', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await withTestItem({ name: 'Item A', stock: 50, price: 300 }, async (createdItem) => {
      const items = await InventoryModel.getAllItems({ limit: 1000, offset: 0 });

      expect(Array.isArray(items)).toBe(true);
      const found = items.find((i) => i.id === createdItem.id);
      expect(found).toBeTruthy();
      expect(found.name).toBe('Item A');
      expect(found.is_active).toBe(true);
    });
  });

  it('should respect category filter', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await withTestItem({ name: 'Garment Item', category: 'Garment', stock: 50, price: 300 }, async (item) => {
      const items = await InventoryModel.getAllItems({ category: 'Garment', limit: 1000, offset: 0 });

      const found = items.find((i) => i.id === item.id);
      expect(found).toBeTruthy();
      expect(found.category).toBe('Garment');
    });
  });

  it('should respect limit and offset pagination', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    const items = await InventoryModel.getAllItems({ limit: 5, offset: 0 });
    expect(items.length).toBeLessThanOrEqual(5);
  });

  it('should return empty array if no items match filters', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    const items = await InventoryModel.getAllItems({ category: 'NonExistentCategory', limit: 1000, offset: 0 });
    expect(items).toEqual([]);
  });

  it('should not return deleted items (is_active = false)', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await withTestItem({ name: 'Item to be deleted', stock: 50, price: 300 }, async (item) => {
      // Soft delete the item
      await InventoryModel.deleteItem(item.id);

      // Verify it's not in getAllItems
      const items = await InventoryModel.getAllItems({ limit: 1000, offset: 0 });
      const found = items.find((i) => i.id === item.id);
      expect(found).toBeUndefined();
    });
  });
});

describe('InventoryModel - searchItems', () => {
  it('should search items by name (case-insensitive)', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await withTestItem({ name: 'Premium Cotton Shirt', stock: 50, price: 300 }, async (item) => {
      const results = await InventoryModel.searchItems('cotton', { limit: 1000, offset: 0 });

      expect(Array.isArray(results)).toBe(true);
      const found = results.find((i) => i.id === item.id);
      expect(found).toBeTruthy();
    });
  });

  it('should respect category filter in search', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await withTestItem({ name: 'Search Test Item', category: 'Material', stock: 50, price: 300 }, async (item) => {
      const results = await InventoryModel.searchItems('search', { category: 'Material', limit: 1000, offset: 0 });

      const found = results.find((i) => i.id === item.id);
      expect(found).toBeTruthy();
    });
  });

  it('should return empty array if no items match search', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    const results = await InventoryModel.searchItems('xyznonexistent12345', { limit: 1000, offset: 0 });
    expect(results).toEqual([]);
  });

  it('should respect limit and offset pagination in search', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    const results = await InventoryModel.searchItems('item', { limit: 5, offset: 0 });
    expect(results.length).toBeLessThanOrEqual(5);
  });
});

describe('InventoryModel - getItemById', () => {
  it('should retrieve item by ID from database', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await withTestItem({ name: 'Specific Item', sku: 'SKU-001', category: 'Test', stock: 75, price: 450 }, async (createdItem) => {
      const fetched = await InventoryModel.getItemById(createdItem.id);

      expect(fetched).toBeTruthy();
      expect(fetched.id).toBe(createdItem.id);
      expect(fetched.name).toBe('Specific Item');
      expect(fetched.sku).toBe('SKU-001');
      expect(fetched.stock).toBe(75);
      expect(Number(fetched.price)).toBe(450);
    });
  });

  it('should return null for non-existent item', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    const fetched = await InventoryModel.getItemById(999999);
    expect(fetched).toBeNull();
  });

  it('should throw error if ID is null', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await expect(InventoryModel.getItemById(null)).rejects.toThrow('ID cannot be null');
  });

  it('should not return deleted items', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await withTestItem({ name: 'Item to delete', stock: 50, price: 300 }, async (item) => {
      await InventoryModel.deleteItem(item.id);

      const fetched = await InventoryModel.getItemById(item.id);
      expect(fetched).toBeNull();
    });
  });
});

describe('InventoryModel - createItem', () => {
  it('should create item with all fields', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    const itemData = {
      name: 'Full Item',
      sku: 'FULL-SKU-001',
      category: 'Garment',
      stock: 100,
      price: 999.99,
      description: 'Complete item with all fields',
      image_url: 'https://example.com/full.jpg',
      reorder_level: 20,
    };

    await withTestItem(itemData, async (created) => {
      expect(created.id).toBeTruthy();
      expect(created.name).toBe('Full Item');
      expect(created.sku).toBe('FULL-SKU-001');
      expect(created.category).toBe('Garment');
      expect(created.stock).toBe(100);
      expect(Number(created.price)).toBe(999.99);
      expect(created.description).toBe('Complete item with all fields');
      expect(created.image_url).toBe('https://example.com/full.jpg');
      expect(created.reorder_level).toBe(20);
      expect(created.is_active).toBe(true);
      expect(created.created_at).toBeTruthy();
    });
  });

  it('should create item with minimal required fields', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    const created = await InventoryModel.createItem({
      id: productId(),
      name: 'Minimal Item',
      stock: 50,
      price: 250,
    });

    try {
      expect(created.id).toBeTruthy();
      expect(created.name).toBe('Minimal Item');
      expect(created.stock).toBe(50);
      expect(Number(created.price)).toBe(250);
      expect(created.sku).toBeNull();
      expect(created.category).toBeNull();
      expect(created.is_active).toBe(true);
    } finally {
      await pool.query('DELETE FROM public.products WHERE id = $1', [created.id]);
    }
  });

  it('should throw error if name is empty', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await expect(
      InventoryModel.createItem({
        name: '',
        stock: 50,
        price: 250,
      })
    ).rejects.toThrow('Item name is required');
  });

  it('should throw error if stock is negative', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await expect(
      InventoryModel.createItem({
        name: 'Item',
        stock: -5,
        price: 250,
      })
    ).rejects.toThrow('Stock must be a non-negative number');
  });

  it('should throw error if price is negative', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await expect(
      InventoryModel.createItem({
        name: 'Item',
        stock: 50,
        price: -10,
      })
    ).rejects.toThrow('Price must be a non-negative number');
  });

  it('should allow zero stock and price', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    const created = await InventoryModel.createItem({
      id: productId(),
      name: 'Free Item',
      stock: 0,
      price: 0,
    });

    try {
      expect(created.stock).toBe(0);
      expect(Number(created.price)).toBe(0);
    } finally {
      await pool.query('DELETE FROM public.products WHERE id = $1', [created.id]);
    }
  });
});

describe('InventoryModel - updateItem', () => {
  it('should update all item fields', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await withTestItem({ name: 'Original Name', stock: 50, price: 300, category: 'Old' }, async (item) => {
      const updated = await InventoryModel.updateItem(item.id, {
        name: 'Updated Name',
        stock: 100,
        price: 500,
        category: 'New',
        description: 'Updated description',
      });

      expect(updated).toBeTruthy();
      expect(updated.name).toBe('Updated Name');
      expect(updated.stock).toBe(100);
      expect(Number(updated.price)).toBe(500);
      expect(updated.category).toBe('New');
      expect(updated.description).toBe('Updated description');
    });
  });

  it('should update partial fields', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await withTestItem({ name: 'Item', stock: 50, price: 300 }, async (item) => {
      const updated = await InventoryModel.updateItem(item.id, {
        stock: 200,
      });

      expect(updated.stock).toBe(200);
    });
  });

  it('should throw error if name is empty', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await withTestItem({ name: 'Item', stock: 50, price: 300 }, async (item) => {
      await expect(
        InventoryModel.updateItem(item.id, {
          name: '',
        })
      ).rejects.toThrow('Item name cannot be empty');
    });
  });

  it('should throw error if stock is negative', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await withTestItem({ name: 'Item', stock: 50, price: 300 }, async (item) => {
      await expect(
        InventoryModel.updateItem(item.id, {
          stock: -5,
        })
      ).rejects.toThrow('Stock cannot be negative');
    });
  });

  it('should throw error if price is negative', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await withTestItem({ name: 'Item', stock: 50, price: 300 }, async (item) => {
      await expect(
        InventoryModel.updateItem(item.id, {
          price: -10,
        })
      ).rejects.toThrow('Price cannot be negative');
    });
  });

  it('should throw error if no fields provided', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await withTestItem({ name: 'Item', stock: 50, price: 300 }, async (item) => {
      await expect(
        InventoryModel.updateItem(item.id, {})
      ).rejects.toThrow('No fields provided to update');
    });
  });

  it('should return null if item not found', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    const result = await InventoryModel.updateItem(999999, { stock: 100 });
    expect(result).toBeNull();
  });

  it('should throw error if ID is null', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await expect(
      InventoryModel.updateItem(null, { stock: 100 })
    ).rejects.toThrow('ID cannot be null');
  });
});

describe('InventoryModel - deleteItem', () => {
  it('should soft delete item (set is_active = false)', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    const created = await InventoryModel.createItem({
      id: productId(),
      name: 'Item to delete',
      stock: 50,
      price: 300,
    });

    try {
      const deleted = await InventoryModel.deleteItem(created.id);

      expect(deleted).toBeTruthy();
      expect(deleted.is_active).toBe(false);

      // Verify it's no longer retrievable
      const fetched = await InventoryModel.getItemById(created.id);
      expect(fetched).toBeNull();
    } finally {
      await pool.query('DELETE FROM public.products WHERE id = $1', [created.id]);
    }
  });

  it('should return null if item not found', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    const result = await InventoryModel.deleteItem(999999);
    expect(result).toBeNull();
  });

  it('should throw error if ID is null', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await expect(InventoryModel.deleteItem(null)).rejects.toThrow('ID cannot be null');
  });
});

describe('InventoryModel - getDesigns', () => {
  it('should retrieve all designs with pagination', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await withTestDesign({ title: 'Design A', url: 'https://example.com/a.jpg' }, async () => {
      const designs = await InventoryModel.getDesigns(1000, 0);

      expect(Array.isArray(designs)).toBe(true);
      expect(designs.length).toBeGreaterThanOrEqual(0);
    });
  });

  it('should respect limit and offset', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    const designs = await InventoryModel.getDesigns(5, 0);
    expect(designs.length).toBeLessThanOrEqual(5);
  });

  it('should return empty array if no designs exist', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    const designs = await InventoryModel.getDesigns(1000, 999999);
    expect(designs).toEqual([]);
  });
});

describe('InventoryModel - createDesign', () => {
  it('should create design with required fields', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await withTestDesign({ title: 'Design Title', url: 'https://example.com/design.jpg' }, async (created) => {
      expect(created.id).toBeTruthy();
      expect(created.title).toBe('Design Title');
      expect(created.url).toBe('https://example.com/design.jpg');
      expect(created.created_at).toBeTruthy();
    });
  });

  it('should create design with optional product_id', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await withTestItem({ name: 'Product', stock: 50, price: 300 }, async (product) => {
      await withTestDesign(
        { title: 'Design for Product', url: 'https://example.com/design.jpg', product_id: product.id },
        async (created) => {
          expect(created.product_id).toBe(product.id);
        }
      );
    });
  });

  it('should throw error if title is empty', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await expect(
      InventoryModel.createDesign({
        title: '',
        url: 'https://example.com/design.jpg',
      })
    ).rejects.toThrow('Design title is required');
  });

  it('should throw error if URL is empty', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await expect(
      InventoryModel.createDesign({
        title: 'Design',
        url: '',
      })
    ).rejects.toThrow('Design URL is required');
  });
});

describe('InventoryModel - deleteDesign', () => {
  it('should delete design from database', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    const created = await InventoryModel.createDesign({
      title: 'Design to delete',
      url: 'https://example.com/delete.jpg',
    });

    const deleted = await InventoryModel.deleteDesign(created.id);

    expect(deleted).toBeTruthy();
    expect(deleted.id).toBe(created.id);

    // Verify it's deleted
    const designs = await InventoryModel.getDesigns(1000, 0);
    const found = designs.find((d) => d.id === created.id);
    expect(found).toBeUndefined();
  });

  it('should return null if design not found', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    const result = await InventoryModel.deleteDesign(999999);
    expect(result).toBeNull();
  });

  it('should throw error if design ID is null', async () => {
    const hasDb = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
    if (!hasDb) return;

    await expect(InventoryModel.deleteDesign(null)).rejects.toThrow('Design ID cannot be null');
  });
});
