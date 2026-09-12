import { apiClient, mockDelay, USE_REAL_API } from './apiClient';
import { store, nextId } from '../data/mockStore';

/** Maps directly to backend/src/routes/vehicleRoutes.js. */
export const vehicleService = {
  async list(params) {
    if (USE_REAL_API) return apiClient.get('/vehicles', { params });
    await mockDelay(350);
    return { data: store.vehicles, pagination: { total: store.vehicles.length } };
  },
  async getById(id) {
    if (USE_REAL_API) return apiClient.get(`/vehicles/${id}`);
    await mockDelay(250);
    return store.vehicles.find((v) => v.id === id) || null;
  },
  async create(payload) {
    if (USE_REAL_API) return apiClient.post('/vehicles', payload);
    await mockDelay(450);
    const vehicle = { id: nextId('v'), ...payload };
    store.vehicles.unshift(vehicle);
    return vehicle;
  },
  async update(id, payload) {
    if (USE_REAL_API) return apiClient.patch(`/vehicles/${id}`, payload);
    await mockDelay(450);
    store.vehicles = store.vehicles.map((v) => (v.id === id ? { ...v, ...payload } : v));
    return store.vehicles.find((v) => v.id === id);
  },
  async remove(id) {
    if (USE_REAL_API) return apiClient.delete(`/vehicles/${id}`);
    await mockDelay(350);
    store.vehicles = store.vehicles.filter((v) => v.id !== id);
    return { success: true };
  },
};
