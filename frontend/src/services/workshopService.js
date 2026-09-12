import { apiClient, mockDelay, USE_REAL_API } from './apiClient';
import { store, nextId } from '../data/mockStore';

/** Maps directly to backend/src/routes/workshopRoutes.js. */
export const workshopService = {
  async list(params) {
    if (USE_REAL_API) return apiClient.get('/workshops', { params });
    await mockDelay(350);
    return { data: store.workshops, pagination: { total: store.workshops.length } };
  },
  async getById(id) {
    if (USE_REAL_API) {
      const res = await apiClient.get(`/workshops/${id}`);
      return res.data;
    }
    await mockDelay(250);
    return store.workshops.find((w) => w.id === id) || null;
  },
  async create(payload) {
    if (USE_REAL_API) return apiClient.post('/workshops', payload);
    await mockDelay(450);
    const workshop = { id: nextId('ws'), status: 'Active', staff: 0, ...payload };
    store.workshops.unshift(workshop);
    return workshop;
  },
  async update(id, payload) {
    if (USE_REAL_API) return apiClient.patch(`/workshops/${id}`, payload);
    await mockDelay(400);
    store.workshops = store.workshops.map((w) => (w.id === id ? { ...w, ...payload } : w));
    return store.workshops.find((w) => w.id === id);
  },
  async remove(id) {
    if (USE_REAL_API) return apiClient.delete(`/workshops/${id}`);
    await mockDelay(350);
    store.workshops = store.workshops.map((w) => (w.id === id ? { ...w, status: 'Inactive' } : w));
    return { success: true };
  },
};
