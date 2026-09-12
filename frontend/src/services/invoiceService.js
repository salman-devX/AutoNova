import { apiClient, mockDelay, USE_REAL_API } from './apiClient';
import { store } from '../data/mockStore';

/** Maps directly to backend/src/routes/invoiceRoutes.js + paymentRoutes.js. */
export const invoiceService = {
  async list(params) {
    if (USE_REAL_API) return apiClient.get('/invoices', { params });
    await mockDelay(350);
    return { data: store.invoices, pagination: { total: store.invoices.length } };
  },
  async getById(id) {
    if (USE_REAL_API) return apiClient.get(`/invoices/${id}`);
    await mockDelay(250);
    return store.invoices.find((i) => i.id === id) || null;
  },
  async create(payload) {
    if (USE_REAL_API) return apiClient.post('/invoices', payload);
    await mockDelay(500);
    return { success: true };
  },
  async recordPayment(payload) {
    if (USE_REAL_API) return apiClient.post('/payments', payload);
    await mockDelay(500);
    store.invoices = store.invoices.map((i) =>
      i.id === payload.invoiceId ? { ...i, status: 'Paid' } : i
    );
    return { success: true };
  },
};
