import express from 'express';

import { salesRouter } from './routes/salesRoutes.js';

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use('/sales', salesRouter);

  return app;
}

// Default export for convenience (supertest can import this)
const app = createApp();
export default app;

