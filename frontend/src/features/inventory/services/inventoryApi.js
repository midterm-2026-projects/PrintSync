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
    throw new Error(body.error || `Inventory request failed (${response.status})`);
  }
  return body;
}

export function getInventoryItems() {
  return request('/inventory/items').then(({ items }) => items);
}

export function createInventoryItem(item) {
  return request('/inventory/items', {
    method: 'POST',
    body: JSON.stringify(item),
  }).then(({ item: createdItem }) => createdItem);
}

export function adjustInventoryStock(id, delta) {
  return request(`/inventory/items/${id}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ delta, reason: 'Manual inventory adjustment' }),
  }).then(({ item }) => item);
}

export function getInventoryDesigns() {
  return request('/inventory/designs').then(({ designs }) => designs);
}
