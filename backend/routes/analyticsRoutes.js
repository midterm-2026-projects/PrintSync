import { Router } from 'express';

import {
  getKpi,
  getSalesTrend,
  getTransactionHistory,
  getAiInsights,
} from '../controllers/analyticsController.js';

export const analyticsRouter = Router();

// KPI (core business metrics)
analyticsRouter.get('/kpi', getKpi);

// Sales trend data for charting
analyticsRouter.get('/sales-trend', getSalesTrend);

// Raw transaction history for display
analyticsRouter.get('/transaction-history', getTransactionHistory);

// AI-generated business insights (server-side LLM)
analyticsRouter.get('/ai-insights', getAiInsights);

