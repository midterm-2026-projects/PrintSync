const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.ok) {
    throw new Error(body.error || `POS request failed (${response.status})`);
  }
  return body;
}

/**
 * Fetch products available for POS.
 * @param {string} [query] - Optional search query
 * @returns {Promise<Array>} List of products
 */
export function getPosProducts(query = '') {
  const params = query ? `?q=${encodeURIComponent(query)}` : '';
  return request(`/pos/products${params}`).then(({ items }) => items);
}

/**
 * Create a new order from cart items.
 * @param {Array<{product_id: number, quantity: number}>} items
 * @returns {Promise<Object>} The created order
 */
export function createPosOrder(items) {
  return request('/pos/orders', {
    method: 'POST',
    body: JSON.stringify({ items }),
  }).then(({ order }) => order);
}

/**
 * Fetch transaction history.
 * @param {Object} [options]
 * @param {number} [options.limit]
 * @param {number} [options.offset]
 * @returns {Promise<Array>} List of orders/transactions
 */
export function getPosTransactions({ limit = 50, offset = 0 } = {}) {
  return request(`/pos/transactions?limit=${limit}&offset=${offset}`).then(({ orders }) => orders);
}

