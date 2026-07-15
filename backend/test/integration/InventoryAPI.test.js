import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import request from 'supertest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env before importing modules that use the database pool.
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const canRun = !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
const createdProductIds = new Set();
const createdDesignIds = new Set();
let app;
let pool;

beforeAll(async () => {
  app = (await import('../../app.js')).default;
  ({ pool } = await import('../../db/pool.js'));
});

afterEach(async () => {
  if (!pool) return;

  for (const designId of createdDesignIds) {
    await pool.query('DELETE FROM public.designs WHERE id = $1', [designId]);
  }
  createdDesignIds.clear();

  for (const productId of createdProductIds) {
    await pool.query('DELETE FROM public.products WHERE id = $1', [productId]);
  }
  createdProductIds.clear();
});

afterAll(async () => {
  await pool?.end();
});

function uniqueName(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function createItem(overrides = {}) {
  const response = await request(app)
    .post('/inventory/items')
    .send({
      name: uniqueName('inventory-api-item'),
      sku: 'API-TEST-SKU',
      category: 'Integration Test',
      stock: 10,
      price: 125.5,
      description: 'Created by InventoryAPI.test.js',
      reorder_level: 2,
      ...overrides,
    });

  if (response.status === 201) {
    createdProductIds.add(response.body.item.id);
  }

  return response;
}

async function createDesign(overrides = {}) {
  const response = await request(app)
    .post('/inventory/designs')
    .send({
      title: uniqueName('inventory-api-design'),
      url: 'https://example.com/integration-test.png',
      uploaded_by: 'integration-test',
      ...overrides,
    });

  if (response.status === 201) {
    createdDesignIds.add(response.body.design.id);
  }

  return response;
}

describe('inventory API integration (routes to controllers to services to model)', () => {
  if (!canRun) {
    it.skip('skipped: missing DB credentials (SUPABASE_DB_URL or PG*)', () => {});
    return;
  }

  describe('POST /inventory/items', () => {
    it('creates an inventory item', async () => {
      const name = uniqueName('inventory-api-item');
      const response = await createItem({ name });

      expect(response.status).toBe(201);
      expect(response.body.ok).toBe(true);
      expect(response.body.item).toEqual(expect.objectContaining({ name, stock: 10 }));
    });

    it('rejects an invalid item before it reaches the model', async () => {
      const response = await request(app)
        .post('/inventory/items')
        .send({ name: ' ', stock: 1, price: 10 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ ok: false, error: 'Item name is required' });
    });
  });

  describe('GET /inventory/items', () => {
    it('returns a matching item when searched by name and category', async () => {
      const name = uniqueName('inventory-api-item');
      const createResponse = await createItem({ name });
      const productId = createResponse.body.item.id;

      const response = await request(app)
        .get('/inventory/items')
        .query({ q: name, category: 'Integration Test' });

      expect(response.status).toBe(200);
      expect(response.body.items).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: productId, name })])
      );
    });
  });

  describe('GET /inventory/items/:id', () => {
    it('retrieves an active item by ID', async () => {
      const createResponse = await createItem();
      const { id: productId, name, stock } = createResponse.body.item;

      const response = await request(app).get(`/inventory/items/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.item).toEqual(expect.objectContaining({ id: productId, name, stock }));
    });
  });

  describe('PUT /inventory/items/:id', () => {
    it('updates an existing item', async () => {
      const createResponse = await createItem();
      const productId = createResponse.body.item.id;

      const response = await request(app)
        .put(`/inventory/items/${productId}`)
        .send({ stock: 15, price: 150 });

      expect(response.status).toBe(200);
      expect(response.body.item).toEqual(expect.objectContaining({ id: productId, stock: 15 }));
      expect(Number(response.body.item.price)).toBe(150);
    });
  });

  describe('DELETE /inventory/items/:id', () => {
    it('soft-deletes an inventory item', async () => {
      const createResponse = await createItem();
      const productId = createResponse.body.item.id;

      const response = await request(app).delete(`/inventory/items/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true, message: 'Item deleted successfully' });

      const missingResponse = await request(app).get(`/inventory/items/${productId}`);
      expect(missingResponse.status).toBe(404);

      const { rows } = await pool.query('SELECT is_active FROM public.products WHERE id = $1', [productId]);
      expect(rows[0].is_active).toBe(false);
    });
  });

  describe('POST /inventory/designs', () => {
    it('creates a design', async () => {
      const title = uniqueName('inventory-api-design');
      const response = await createDesign({ title });

      expect(response.status).toBe(201);
      expect(response.body.design).toEqual(expect.objectContaining({ title }));
    });
  });

  describe('GET /inventory/designs', () => {
    it('lists a newly created design', async () => {
      const title = uniqueName('inventory-api-design');
      const createResponse = await createDesign({ title });
      const designId = createResponse.body.design.id;

      const response = await request(app).get('/inventory/designs').query({ limit: 100 });

      expect(response.status).toBe(200);
      expect(response.body.designs).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: designId, title })])
      );
    });
  });

  describe('DELETE /inventory/designs/:id', () => {
    it('deletes a design', async () => {
      const createResponse = await createDesign();
      const designId = createResponse.body.design.id;

      const response = await request(app).delete(`/inventory/designs/${designId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true, message: 'Design deleted successfully' });
      createdDesignIds.delete(designId);
    });
  });
});
