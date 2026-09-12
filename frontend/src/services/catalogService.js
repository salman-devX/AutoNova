import { apiClient, mockDelay, USE_REAL_API } from './apiClient';
import { store, nextId } from '../data/mockStore';

/** Maps directly to backend/src/routes/serviceRoutes.js. Named catalogService to avoid clashing with browser APIs. */
export const catalogService = {
  async list(params) {
    if (USE_REAL_API) return apiClient.get('/services', { params });
    await mockDelay(300);
    return { data: store.services, pagination: { total: store.services.length } };
  },
  async create(payload) {
    if (USE_REAL_API) return apiClient.post('/services', payload);
    await mockDelay(450);
    const service = { id: nextId('svc'), isActive: true, ...payload };
    store.services.unshift(service);
    return service;
  },
  async update(id, payload) {
    if (USE_REAL_API) return apiClient.patch(`/services/${id}`, payload);
    await mockDelay(400);
    store.services = store.services.map((s) => (s.id === id ? { ...s, ...payload } : s));
    return store.services.find((s) => s.id === id);
  },
  async remove(id) {
    if (USE_REAL_API) return apiClient.delete(`/services/${id}`);
    await mockDelay(350);
    store.services = store.services.filter((s) => s.id !== id);
    return { success: true };
  },
};
