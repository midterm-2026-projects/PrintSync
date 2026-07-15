import {
  processTransaction,
  finalizeSale,
  getTransactionHistory,
} from '../services/salesService.js';

function normalizeItemsPayload(items) {
  // Accept either:
  // - [{ productId, productName, quantity, unitPrice }]
  // - or already-normalized fields
  if (!Array.isArray(items)) return null;

  const normalized = items.map((it) => {
    if (!it || typeof it !== 'object') return it;

    return {
      productId: it.productId ?? it.product_id,
      productName: it.productName ?? it.product_name,
      quantity: it.quantity,
      unitPrice: it.unitPrice ?? it.unit_price,
    };
  });

  return normalized;
}

export async function createTransaction(req, res) {
  try {
    const { items } = req.body ?? {};
    const normalizedItems = normalizeItemsPayload(items);

    const result = await processTransaction(normalizedItems);

    return res.status(201).json({
      ok: true,
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(400).json({ ok: false, error: message });
  }
}

export async function finalizeTransaction(req, res) {
  try {
    const { items } = req.body ?? {};
    const normalizedItems = normalizeItemsPayload(items);

    const result = await finalizeSale(normalizedItems);

    return res.status(201).json({
      ok: true,
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(400).json({ ok: false, error: message });
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

