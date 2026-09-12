import { apiClient, mockDelay, USE_REAL_API } from './apiClient';
import { store } from '../data/mockStore';

/** Maps directly to backend/src/routes/customerRoutes.js. */
export const customerService = {
  async list(params) {
    if (USE_REAL_API) return apiClient.get('/customers', { params });
    await mockDelay(350);
    let data = store.customers;
    if (params?.search) {
      const q = params.search.toLowerCase();
      data = data.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q));
    }
    return { data, pagination: { total: data.length } };
  },
  async getById(id) {
    if (USE_REAL_API) return apiClient.get(`/customers/${id}`);
    await mockDelay(250);
    return store.customers.find((c) => c.id === id) || null;
  },
  async update(id, payload) {
    if (USE_REAL_API) return apiClient.patch(`/customers/${id}`, payload);
    await mockDelay(400);
    store.customers = store.customers.map((c) => (c.id === id ? { ...c, ...payload } : c));
    return store.customers.find((c) => c.id === id);
  },
};
