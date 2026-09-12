import { apiClient, mockDelay, USE_REAL_API } from './apiClient';
import { store, nextId } from '../data/mockStore';

function computeStatus(part) {
  if (part.qty <= 0) return 'Out of Stock';
  if (part.qty <= part.minStock) return 'Low Stock';
  return 'Active';
}

/** Maps directly to backend/src/routes/partRoutes.js + inventoryRoutes.js. */
export const inventoryService = {
  async list(params) {
    if (USE_REAL_API) return apiClient.get('/parts', { params });
    await mockDelay(350);
    return { data: store.parts, pagination: { total: store.parts.length } };
  },
  async getById(id) {
    if (USE_REAL_API) return apiClient.get(`/parts/${id}`);
    await mockDelay(250);
    return store.parts.find((p) => p.id === id) || null;
  },
  async create(payload) {
    if (USE_REAL_API) return apiClient.post('/parts', payload);
    await mockDelay(450);
    const part = { id: nextId('p'), qty: 0, minStock: 5, ...payload };
    part.status = computeStatus(part);
    store.parts.unshift(part);
    return part;
  },
  async update(id, payload) {
    if (USE_REAL_API) return apiClient.patch(`/parts/${id}`, payload);
    await mockDelay(450);
    store.parts = store.parts.map((p) => {
      if (p.id !== id) return p;
      const updated = { ...p, ...payload };
      updated.status = computeStatus(updated);
      return updated;
    });
    return store.parts.find((p) => p.id === id);
  },
  async remove(id) {
    if (USE_REAL_API) return apiClient.delete(`/parts/${id}`);
    await mockDelay(350);
    store.parts = store.parts.filter((p) => p.id !== id);
    return { success: true };
  },
  async adjustStock({ partId, quantityDelta, reason }) {
    if (USE_REAL_API) return apiClient.post('/inventory/adjust', { partId, quantityDelta, reason });
    await mockDelay(400);
    store.parts = store.parts.map((p) => {
      if (p.id !== partId) return p;
      const updated = { ...p, qty: Math.max(0, p.qty + quantityDelta) };
      updated.status = computeStatus(updated);
      return updated;
    });
    return store.parts.find((p) => p.id === partId);
  },
  async listTransactions(params) {
    if (USE_REAL_API) return apiClient.get('/inventory/transactions', { params });
    await mockDelay(300);
    return { data: [], pagination: { total: 0 } };
  },
};
