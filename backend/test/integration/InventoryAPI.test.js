import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

vi.mock('../../services/InventoryService.js', () => ({
  InventoryService: {
    getItems: vi.fn(),
    getItemById: vi.fn(),
    createItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    getDesigns: vi.fn(),
    createDesign: vi.fn(),
    deleteDesign: vi.fn(),
  },
}));

import app from '../../app.js';
import { InventoryService } from '../../services/InventoryService.js';

afterEach(() => {
  vi.clearAllMocks();
});

const mockItem = {
  id: 101,
  name: 'Mock T-Shirt',
  sku: 'MOCK-TSHIRT',
  category: 'Garment',
  stock: 10,
  price: 125.5,
  description: 'Mock inventory item',
  image_url: null,
  reorder_level: 2,
  is_active: true,
};

const mockDesign = {
  id: 201,
  title: 'Mock Design',
  url: 'https://example.com/mock-design.png',
  product_id: null,
  uploaded_by: 'test-user',
};

describe('inventory API (routes to controllers to mocked services)', () => {
  describe('POST /inventory/items', () => {
    it('creates an inventory item using the service response', async () => {
      vi.mocked(InventoryService.createItem).mockResolvedValue(mockItem);

      const response = await request(app)
        .post('/inventory/items')
        .send({
          name: mockItem.name,
          sku: mockItem.sku,
          category: mockItem.category,
          stock: mockItem.stock,
          price: mockItem.price,
          description: mockItem.description,
          reorder_level: mockItem.reorder_level,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ ok: true, item: mockItem });
      expect(InventoryService.createItem).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockItem.name,
          sku: mockItem.sku,
          category: mockItem.category,
          stock: mockItem.stock,
          price: mockItem.price,
        })
      );
    });

    it('returns the service validation error', async () => {
      vi.mocked(InventoryService.createItem).mockRejectedValue(new Error('Item name is required'));

      const response = await request(app)
        .post('/inventory/items')
        .send({ name: ' ', stock: 1, price: 10 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ ok: false, error: 'Item name is required' });
    });
  });

  describe('GET /inventory/items', () => {
    it('returns items from the service search result', async () => {
      vi.mocked(InventoryService.getItems).mockResolvedValue([mockItem]);

      const response = await request(app)
        .get('/inventory/items')
        .query({ q: 'shirt', category: 'Garment', limit: 25, offset: 5 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true, items: [mockItem], count: 1 });
      expect(InventoryService.getItems).toHaveBeenCalledWith('shirt', 'Garment', 25, 5);
    });
  });

  describe('GET /inventory/items/:id', () => {
    it('returns an item from the service', async () => {
      vi.mocked(InventoryService.getItemById).mockResolvedValue(mockItem);

      const response = await request(app).get(`/inventory/items/${mockItem.id}`);


      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true, item: mockItem });
      expect(InventoryService.getItemById).toHaveBeenCalledWith(String(mockItem.id));
    });

    it('returns 404 when the service cannot find the item', async () => {
      vi.mocked(InventoryService.getItemById).mockRejectedValue(new Error('Item not found with id: 999'));

      const response = await request(app).get('/inventory/items/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ ok: false, error: 'Item not found with id: 999' });
    });
  });

  describe('PUT /inventory/items/:id', () => {
    it('updates an item using the service response', async () => {
      const updatedItem = { ...mockItem, stock: 15, price: 150 };
      vi.mocked(InventoryService.updateItem).mockResolvedValue(updatedItem);

      const response = await request(app)
        .put(`/inventory/items/${mockItem.id}`)
        .send({ stock: 15, price: 150 });


      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true, item: updatedItem });
      expect(InventoryService.updateItem).toHaveBeenCalledWith(
        String(mockItem.id),
        expect.objectContaining({ stock: 15, price: 150 })
      );
    });
  });

  describe('DELETE /inventory/items/:id', () => {
    it('deletes an item through the service', async () => {
      vi.mocked(InventoryService.deleteItem).mockResolvedValue(mockItem);

      const response = await request(app).delete(`/inventory/items/${mockItem.id}`);


      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true, message: 'Item deleted successfully' });
      expect(InventoryService.deleteItem).toHaveBeenCalledWith(String(mockItem.id));
    });
  });

  describe('POST /inventory/designs', () => {
    it('creates a design using the service response', async () => {
      vi.mocked(InventoryService.createDesign).mockResolvedValue(mockDesign);

      const response = await request(app)
        .post('/inventory/designs')
        .send({
          title: mockDesign.title,
          url: mockDesign.url,
          uploaded_by: mockDesign.uploaded_by,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ ok: true, design: mockDesign });
      expect(InventoryService.createDesign).toHaveBeenCalledWith(
        expect.objectContaining({ title: mockDesign.title, url: mockDesign.url })
      );
    });
  });

  describe('GET /inventory/designs', () => {
    it('returns designs from the service', async () => {
      vi.mocked(InventoryService.getDesigns).mockResolvedValue([mockDesign]);

      const response = await request(app).get('/inventory/designs').query({ limit: 25, offset: 5 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true, designs: [mockDesign], count: 1 });
      expect(InventoryService.getDesigns).toHaveBeenCalledWith(25, 5);
    });
  });

  describe('DELETE /inventory/designs/:id', () => {
    it('deletes a design through the service', async () => {
      vi.mocked(InventoryService.deleteDesign).mockResolvedValue(mockDesign);

      const response = await request(app).delete(`/inventory/designs/${mockDesign.id}`);


      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true, message: 'Design deleted successfully' });
      expect(InventoryService.deleteDesign).toHaveBeenCalledWith(String(mockDesign.id));
    });
  });
});