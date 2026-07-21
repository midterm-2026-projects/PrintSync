import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { posModel } from '../../models/posModel.js';

vi.stubEnv('GEMINI_API_KEY', 'AQ.fake');

let app;
const aiInsightsResponse = {
  output: [
    {
      content: [
        {
          text: 'AI-generated insight: demand is rising for bestselling products.',
        },
      ],
    },
  ],
};

const fakeOrders = [
  {
    orderId: 'order-1',
    createdAt: '2026-07-20T12:00:00.000Z',
    totalAmount: 123.45,
    items: [{ productName: 'Widget', quantity: 2, unitPrice: 50, subtotal: 100 }],
  },
];

const fetchMock = vi.fn(async () => ({
  ok: true,
  json: vi.fn(async () => aiInsightsResponse),
}));

beforeAll(async () => {
  global.fetch = fetchMock;
  const appModule = await import('../../app.js');
  app = appModule.default;
});

beforeEach(() => {
  vi.spyOn(posModel, 'queryRecentOrdersForAi').mockResolvedValue(fakeOrders);
  fetchMock.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LLM client integration via /analytics/ai-insights', () => {
  it('fetches the latest 15 orders and returns AI insights', async () => {
    const res = await request(app).get('/analytics/ai-insights');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.insights).toBe('AI-generated insight: demand is rising for bestselling products.');
    expect(res.body.orderCount).toBe(fakeOrders.length);

    expect(posModel.queryRecentOrdersForAi).toHaveBeenCalledWith(15);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const fetchCall = fetchMock.mock.calls[0];
    expect(fetchCall[0]).toContain('generativelanguage.googleapis.com');
    expect(fetchCall[1]).toMatchObject({
      method: 'POST',
      headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
    });
  });

  it('passes explicit limit to the AI insights service when provided', async () => {
    const res = await request(app).get('/analytics/ai-insights').query({ limit: '10' });

    expect(res.status).toBe(200);
    expect(posModel.queryRecentOrdersForAi).toHaveBeenCalledWith(10);
  });
});
