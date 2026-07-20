import * as analyticsService from '../services/analyticsService.js';

const { getErrorMessage, invalidPeriodResponse } = analyticsService;

// GET /analytics/kpi
export async function getKpi(req, res) {
  try {
    const period = analyticsService.parsePeriod(req.query?.period);

    if (!period) return invalidPeriodResponse(res);

    const kpi = await analyticsService.getKpi(period);

    return res.status(200).json({
      ok: true,
      kpi,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: getErrorMessage(err) });
  }
}

// GET /analytics/sales-trend
export async function getSalesTrend(req, res) {
  try {
    const period = analyticsService.parsePeriod(req.query?.period);

    if (!period) return invalidPeriodResponse(res);

    const trend = await analyticsService.getSalesTrend(period);

    return res.status(200).json({
      ok: true,
      trend,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: getErrorMessage(err) });
  }
}

// GET /analytics/transaction-history
export async function getTransactionHistory(req, res) {
  try {
    const period = analyticsService.parsePeriod(req.query?.period);

    if (!period) return invalidPeriodResponse(res);

    const result = await analyticsService.getTransactionHistory(period);

    return res.status(200).json({
      ok: true,
      transactions: result?.transactions ?? [],
      count: result?.transactions?.length ?? 0,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: getErrorMessage(err) });
  }
}

