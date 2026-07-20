/**
 * analyticsModel.js
 * DB query layer for analytics.
 *
 * These functions are used by analyticsService.
 * SQL is intentionally simple and aligned with `backend/SQL.txt`:
 * - public.orders(order_id, total_amount, created_at)
 */

import { pool } from '../db/pool.js';

export const analyticsModel = {
  // KPI: total revenue + number of orders in the requested interval
  // interval is expected to be a Postgres interval string, e.g. '7 days'
  async queryKpiByPeriod(_period = '30d', interval = '30 days') {
    const { rows } = await pool.query(
      `
      SELECT
        COALESCE(SUM(total_amount), 0) AS "totalRevenue",
        COUNT(order_id) AS "totalOrders"
      FROM public.orders
      WHERE created_at >= NOW() - $1::interval
    `,
      [interval]
    );

    return rows?.[0] ?? { totalRevenue: 0, totalOrders: 0 };
  },

  // Sales trend: series of daily totals within period/interval
  async querySalesTrendByPeriod(_period = '30d', interval = '30 days') {
    const { rows } = await pool.query(
      `
      SELECT
        to_char(created_at::date, 'YYYY-MM-DD') AS "date",
        SUM(total_amount)::numeric AS "amount"
      FROM public.orders
      WHERE created_at >= NOW() - $1::interval
      GROUP BY created_at::date
      ORDER BY created_at::date ASC
    `,
      [interval]
    );

    return {
      data: (rows ?? []).map((r) => ({
        date: r.date,
        amount: Number(r.amount),
      })),
    };
  },

  // Transactions: list of orders within period/interval (id + amount + createdAt)
  async queryTransactionsByPeriod(_period = '30d', interval = '30 days') {
    const { rows } = await pool.query(
      `
      SELECT
        order_id AS "id",
        total_amount::numeric AS "amount",
        created_at AS "createdAt"
      FROM public.orders
      WHERE created_at >= NOW() - $1::interval
      ORDER BY created_at DESC
    `,
      [interval]
    );

    return {
      transactions: (rows ?? []).map((r) => ({
        id: r.id,
        amount: Number(r.amount),
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      })),
    };
  },
};

export default analyticsModel;
