const API_BASE = '/api/grocery';

async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error || (data.details && data.details.join(', ')) || 'API request failed';
    throw new Error(errorMsg);
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  // AI Parsing
  parseMessages: (message) =>
    request(`${API_BASE}/parse`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  getAiStatus: () => request(`${API_BASE}/ai-status`),

  getStats: () => request(`${API_BASE}/stats`),

  // Lists
  getLists: () => request(`${API_BASE}/lists`),

  getListById: (id) => request(`${API_BASE}/lists/${id}`),

  createList: (listData) =>
    request(`${API_BASE}/lists`, {
      method: 'POST',
      body: JSON.stringify(listData),
    }),

  deleteList: (id) =>
    request(`${API_BASE}/lists/${id}`, {
      method: 'DELETE',
    }),

  markAllPurchased: (id) =>
    request(`${API_BASE}/lists/${id}/complete-all`, {
      method: 'POST',
    }),

  addItemToList: (listId, item) =>
    request(`${API_BASE}/lists/${listId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  // Items
  updateItem: (id, updates) =>
    request(`${API_BASE}/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  togglePurchase: (id, isPurchased) =>
    request(`${API_BASE}/items/${id}/purchase`, {
      method: 'PATCH',
      body: JSON.stringify({ isPurchased }),
    }),

  deleteItem: (id) =>
    request(`${API_BASE}/items/${id}`, {
      method: 'DELETE',
    }),

  // Preferences
  getPreferences: () => request(`${API_BASE}/preferences`),

  createPreference: (prefData) =>
    request(`${API_BASE}/preferences`, {
      method: 'POST',
      body: JSON.stringify(prefData),
    }),

  updatePreference: (id, prefData) =>
    request(`${API_BASE}/preferences/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(prefData),
    }),

  deletePreference: (id) =>
    request(`${API_BASE}/preferences/${id}`, {
      method: 'DELETE',
    }),
};
