import {
  processTransaction,
  finalizeSale,
  getTransactionHistory,
  normalizeItemsPayload,
  isFinalizePath,
} from '../services/salesService.js';

export async function transaction(req, res) {
  try {
    const { items } = req.body ?? {};
    const normalizedItems = normalizeItemsPayload(items);

    const result = isFinalizePath(req.route?.path)
      ? await finalizeSale(normalizedItems)
      : await processTransaction(normalizedItems);

    return res.status(201).json({
      ok: true,
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ ok: false, error: message });
  }
}

export async function getTransactions(_req, res) {
  try {
    const history = await getTransactionHistory();
    return res.status(200).json({ ok: true, history });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ ok: false, error: message });
  }
}

