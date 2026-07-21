/**
 * llmClient.js
 * Minimal Gemini adapter with a lightweight local fallback when API keys
 * are not present. Designed to be mocked in unit tests.
 */

const GEMINI_API_URL = process.env.GEMINI_API_URL || process.env.GEMINI_ENDPOINT;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || process.env.GEMINI_MODEL_NAME || 'gemini-1.0';

async function _ensureFetch() {
  if (typeof fetch === 'function') return fetch;
  // Try to dynamically import node-fetch if available (for older Node versions)
  try {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const mod = await import('node-fetch');
    // node-fetch v3 default export is the fetch function
    return mod.default || mod;  
  } catch (err) {
    throw new Error('Global `fetch` is not available. Use Node 18+ or install `node-fetch`.');
  }
}

/**
 * callGeminiRaw: adaptively call the configured LLM provider.
 * - If GEMINI_API_URL is provided, use it with Bearer auth.
 * - Else, try to infer provider from API key and call a reasonable default:
 *   - Google generative API (bearer token or API key) at generativelanguage.googleapis.com
 *   - (Optional) OpenAI-compatible endpoint if provided by GEMINI_API_KEY format
 */
async function callGeminiRaw(prompt, opts = {}) {
  if (!GEMINI_API_KEY && !GEMINI_API_URL) {
    throw new Error('Gemini API configuration missing');
  }

  const fetchFn = await _ensureFetch();

  // If explicit URL provided, call it using Bearer header.
  if (GEMINI_API_URL) {
    const resp = await fetchFn(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GEMINI_API_KEY}`,
      },
      body: JSON.stringify({ prompt, ...opts }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Gemini API error: ${resp.status} ${txt}`);
    }
    return resp.json();
  }

  // No explicit URL: attempt Google Generative API first.
  // Build a textual prompt representation.
  const textPrompt =
    typeof prompt === 'string'
      ? prompt
      : `${prompt.instruction || ''}\n\n${JSON.stringify(prompt.data || prompt, null, 2)}`;

  // If key looks like a Google API key (starts with AI or 'AIza') we can pass it as query param.
  const isGoogleApiKey = /^AIza|^A0B/.test(GEMINI_API_KEY);
  const isBearerLike = /^ya29\.|^AQ\./.test(GEMINI_API_KEY);

  // Use the generative language endpoint for Gemini-style models.
  const model = GEMINI_MODEL;
  const googleUrlBase = `https://generativelanguage.googleapis.com/v1beta2/models/${model}:generateText`;

  let url = googleUrlBase;
  const headers = { 'Content-Type': 'application/json' };

  if (isGoogleApiKey) {
    url = `${googleUrlBase}?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  } else if (isBearerLike) {
    headers.Authorization = `Bearer ${GEMINI_API_KEY}`;
  } else {
    // For other key shapes, try bearer auth first (some Gemini keys are used as bearer tokens).
    headers.Authorization = `Bearer ${GEMINI_API_KEY}`;
  }

  const body = {
    // The Generative Language API expects `prompt` with a `text` field.
    prompt: { text: textPrompt },
    // Allow callers to pass additional generation options.
    ...opts,
  };

  const resp = await fetchFn(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Gemini API error: ${resp.status} ${txt}`);
  }

  return resp.json();
}

function localSummarizeOrders(orders = []) {
  // Lightweight summary when no LLM key is available.
  const totalRevenue = orders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
  const orderCount = orders.length;
  const avgOrder = orderCount === 0 ? 0 : totalRevenue / orderCount;

  const productCounts = new Map();
  for (const o of orders) {
    for (const it of o.items || []) {
      const name = it.productName || 'unknown';
      const qty = Number(it.quantity) || 0;
      productCounts.set(name, (productCounts.get(name) || 0) + qty);
    }
  }

  const top = Array.from(productCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, qty]) => `${name} (${qty})`);

  const lines = [];
  lines.push(`Orders analyzed: ${orderCount}`);
  lines.push(`Total revenue (sample): ${totalRevenue.toFixed(2)}`);
  lines.push(`Average order value: ${avgOrder.toFixed(2)}`);
  if (top.length > 0) lines.push(`Top products: ${top.join(', ')}`);
  lines.push('Insights:');
  if (totalRevenue === 0) {
    lines.push('- No revenue in the sampled orders.');
  } else {
    lines.push('- Recent orders show measurable revenue; consider promoting top products.');
    lines.push('- Monitor inventory for the top-selling items to avoid stockouts.');
  }

  return lines.join('\n');
}

export async function generateAIBusinessInsights(orders = [], options = {}) {
  // Orders: [{ orderId, createdAt, totalAmount, items: [{productName, quantity, unitPrice, subtotal}] }]
  // If API key is present, call Gemini; otherwise, return a local summary.
  if (!Array.isArray(orders)) throw new TypeError('orders must be an array');

  // If API credentials are present, attempt a remote call.
  if (GEMINI_API_KEY) {
    const prompt = {
      instruction:
        "You are an analytics assistant. Given the recent orders JSON, produce 3 concise, actionable business insights about demand, product opportunities, and revenue trends. Keep each insight to one sentence.",
      data: orders,
    };

    try {
      const res = await callGeminiRaw(prompt, options);
      // Provider-specific handling: try common fields.
      if (res?.output?.[0]?.content?.[0]?.text) return res.output[0].content[0].text;
      if (res?.text) return res.text;
      if (typeof res === 'string') return res;
      return JSON.stringify(res);
    } catch (err) {
      // Fallback to local summary on errors.
      return `LLM error: ${err.message}\nFallback summary:\n${localSummarizeOrders(orders)}`;
    }
  }

  // No Gemini config — return deterministic local summary useful for dev/tests.
  return localSummarizeOrders(orders);
}

export default { generateAIBusinessInsights };
