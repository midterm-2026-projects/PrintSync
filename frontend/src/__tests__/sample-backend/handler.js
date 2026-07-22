import { http, HttpResponse } from 'msw';

export const analyticsFixtures = {
  byPeriod: {
    '7d': {
      kpi: { totalRevenue: 700, totalOrders: 1 },
      trend: [{ date: '2026-07-21', amount: 700 }],
      transactions: [{ id: 'TXN-7D', amount: 700, createdAt: '2026-07-21T00:00:00.000Z' }],
    },
    '30d': {
      kpi: { totalRevenue: 5700, totalOrders: 3 },
      trend: [
        { date: '2026-07-19', amount: 1500 },
        { date: '2026-07-20', amount: 3000 },
        { date: '2026-07-21', amount: 1200 },
      ],
      transactions: [
        { id: 'TXN-001', amount: 1500, createdAt: '2026-07-19T00:00:00.000Z' },
        { id: 'TXN-002', amount: 3000, createdAt: '2026-07-20T00:00:00.000Z' },
        { id: 'TXN-003', amount: 1200, createdAt: '2026-07-21T00:00:00.000Z' },
      ],
    },
    '90d': {
      kpi: { totalRevenue: 9000, totalOrders: 4 },
      trend: [{ date: '2026-07-21', amount: 9000 }],
      transactions: [{ id: 'TXN-90D', amount: 9000, createdAt: '2026-07-21T00:00:00.000Z' }],
    },
  },
};

const fixtureFor = (request) => analyticsFixtures.byPeriod[new URL(request.url).searchParams.get('period')] ?? analyticsFixtures.byPeriod['30d'];

export const inventoryFixtures = {
  items: [
    { id: 101, name: 'Cotton T-Shirt', sku: 'CT-001', category: 'Garment', stock: 50, price: 350, description: 'Premium cotton t-shirt', image_url: null, reorder_level: 10, is_active: true },
    { id: 102, name: 'Polo Shirt', sku: 'PS-001', category: 'Garment', stock: 30, price: 450, description: 'Classic polo shirt', image_url: null, reorder_level: 5, is_active: true },
    { id: 103, name: 'Hoodie', sku: 'HD-001', category: 'Garment', stock: 20, price: 750, description: 'Comfortable hoodie', image_url: null, reorder_level: 5, is_active: true },
    { id: 104, name: 'Mug', sku: 'MG-001', category: 'Material', stock: 100, price: 150, description: 'Ceramic mug', image_url: null, reorder_level: 20, is_active: true },
    { id: 105, name: 'Cap', sku: 'CP-001', category: 'Garment', stock: 40, price: 250, description: 'Baseball cap', image_url: null, reorder_level: 10, is_active: true },
  ],
  designs: [
    { id: 201, title: 'Summer Vibes', url: 'https://example.com/summer.png', product_id: null, uploaded_by: 'admin' },
    { id: 202, title: 'Geometric Pattern', url: 'https://example.com/geo.png', product_id: 101, uploaded_by: 'admin' },
  ],
};

const initialInventoryFixtures = structuredClone(inventoryFixtures);

export function resetInventoryFixtures() {
  inventoryFixtures.items = structuredClone(initialInventoryFixtures.items);
  inventoryFixtures.designs = structuredClone(initialInventoryFixtures.designs);
}

export const posFixtures = {
  products: [
    { id: 1, productName: 'Cotton T-Shirt', price: 350, stock: 50, category: 'Garment', image_url: null },
    { id: 2, productName: 'Polo Shirt', price: 450, stock: 30, category: 'Garment', image_url: null },
    { id: 3, productName: 'Hoodie', price: 750, stock: 20, category: 'Garment', image_url: null },
    { id: 4, productName: 'Mug', price: 150, stock: 100, category: 'Material', image_url: null },
    { id: 5, productName: 'Cap', price: 250, stock: 40, category: 'Garment', image_url: null },
  ],
  orders: [
    {
      orderId: 'TXN-20250127-A3F9K2',
      totalAmount: 700,
      createdAt: '2025-01-27T12:00:00.000Z',
      itemsCount: 2,
    },
  ],
};

export const handlers = [
  http.get('/analytics/kpi', ({ request }) => {
    const fixture = fixtureFor(request);
    return HttpResponse.json({ ok: true, kpi: fixture.kpi });
  }),
  http.get('/analytics/sales-trend', ({ request }) => {
    const fixture = fixtureFor(request);
    return HttpResponse.json({ ok: true, trend: { data: fixture.trend } });
  }),
  http.get('/analytics/transaction-history', ({ request }) => {
    const fixture = fixtureFor(request);
    return HttpResponse.json({ ok: true, transactions: fixture.transactions, count: fixture.transactions.length });
  }),
  http.get('/analytics/ai-insights', () => HttpResponse.json({ ok: true, insights: 'Based on your sales data, trends indicate high demand for custom prints.', orderCount: 3 })),

  // Inventory endpoints
  http.get('/inventory/items', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const category = url.searchParams.get('category') || '';
    let items = inventoryFixtures.items;
    if (q) {
      items = items.filter((item) => item.name.toLowerCase().includes(q.toLowerCase()));
    }
    if (category) {
      items = items.filter((item) => item.category === category);
    }
    return HttpResponse.json({ ok: true, items, count: items.length });
  }),

  http.post('/inventory/items', async ({ request }) => {
    const body = await request.json();
    const newItem = {
      id: Math.floor(1_000_000 + Math.random() * 8_999_999),
      name: body.name,
      sku: body.sku || null,
      category: body.category || null,
      stock: body.stock,
      price: body.price,
      description: body.description || null,
      image_url: body.image_url || null,
      reorder_level: body.reorder_level || 0,
      is_active: true,
    };
    inventoryFixtures.items.push(newItem);
    return HttpResponse.json({ ok: true, item: newItem }, { status: 201 });
  }),

  http.get('/inventory/items/:id', ({ params }) => {
    const { id } = params;
    const item = inventoryFixtures.items.find((i) => String(i.id) === id);
    if (!item) {
      return HttpResponse.json({ ok: false, error: `Item not found with id: ${id}` }, { status: 404 });
    }
    return HttpResponse.json({ ok: true, item });
  }),

  http.put('/inventory/items/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    const index = inventoryFixtures.items.findIndex((i) => String(i.id) === id);
    if (index === -1) {
      return HttpResponse.json({ ok: false, error: `Item not found with id: ${id}` }, { status: 404 });
    }
    const updatedItem = { ...inventoryFixtures.items[index], ...body };
    inventoryFixtures.items[index] = updatedItem;
    return HttpResponse.json({ ok: true, item: updatedItem });
  }),

  http.delete('/inventory/items/:id', ({ params }) => {
    const { id } = params;
    const index = inventoryFixtures.items.findIndex((i) => String(i.id) === id);
    if (index === -1) {
      return HttpResponse.json({ ok: false, error: `Item not found with id: ${id}` }, { status: 404 });
    }
    inventoryFixtures.items.splice(index, 1);
    return HttpResponse.json({ ok: true, message: 'Item deleted successfully' });
  }),

  http.get('/inventory/designs', ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit')) || 100;
    const offset = Number(url.searchParams.get('offset')) || 0;
    const designs = inventoryFixtures.designs.slice(offset, offset + limit);
    return HttpResponse.json({ ok: true, designs, count: designs.length });
  }),

  http.post('/inventory/designs', async ({ request }) => {
    const body = await request.json();
    const newDesign = {
      id: Math.floor(200_000 + Math.random() * 799_999),
      title: body.title,
      url: body.url,
      product_id: body.product_id || null,
      uploaded_by: body.uploaded_by || null,
    };
    inventoryFixtures.designs.push(newDesign);
    return HttpResponse.json({ ok: true, design: newDesign }, { status: 201 });
  }),

  http.delete('/inventory/designs/:id', ({ params }) => {
    const { id } = params;
    const index = inventoryFixtures.designs.findIndex((d) => String(d.id) === id);
    if (index === -1) {
      return HttpResponse.json({ ok: false, error: `Design not found with id: ${id}` }, { status: 404 });
    }
    inventoryFixtures.designs.splice(index, 1);
    return HttpResponse.json({ ok: true, message: 'Design deleted successfully' });
  }),

  // POS endpoints
  http.get('/pos/products', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    let items = posFixtures.products;
    if (q) {
      items = items.filter((item) => item.productName.toLowerCase().includes(q.toLowerCase()));
    }
    return HttpResponse.json({ ok: true, items, count: items.length });
  }),

  http.get('/pos/products/:id', ({ params }) => {
    const { id } = params;
    const item = posFixtures.products.find((p) => String(p.id) === id);
    if (!item) {
      return HttpResponse.json({ ok: false, error: `Product not found with id: ${id}` }, { status: 404 });
    }
    return HttpResponse.json({ ok: true, item });
  }),

  http.post('/pos/orders', async ({ request }) => {
    const body = await request.json();
    const orderId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newOrder = {
      orderId,
      totalAmount: body.items?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0) || 0,
      createdAt: new Date().toISOString(),
      itemsCount: body.items?.length || 0,
    };
    posFixtures.orders.push(newOrder);
    return HttpResponse.json({ ok: true, order: newOrder }, { status: 201 });
  }),

  http.get('/pos/orders', () => {
    return HttpResponse.json({ ok: true, orders: posFixtures.orders, count: posFixtures.orders.length });
  }),

  http.get('/pos/orders/:orderId', ({ params }) => {
    const { orderId } = params;
    const order = posFixtures.orders.find((o) => o.orderId === orderId);
    if (!order) {
      return HttpResponse.json({ ok: false, error: `Order not found: ${orderId}` }, { status: 404 });
    }
    return HttpResponse.json({
      ok: true,
      order: {
        orderId: order.orderId,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        items: [
          { id: 1, productId: 1, productName: 'Cotton T-Shirt', quantity: 2, unitPrice: 350, subtotal: 700 },
        ],
      },
    });
  }),

  http.get('/pos/transactions', () => {
    return HttpResponse.json({ ok: true, orders: posFixtures.orders, count: posFixtures.orders.length });
  }),
];
