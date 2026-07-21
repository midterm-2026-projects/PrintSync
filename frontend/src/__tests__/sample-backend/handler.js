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
  http.get('/analytics/ai-insights', () => HttpResponse.json({ ok: true, insights: 'Restock custom prints before the next demand peak.', orderCount: 3 })),
];

