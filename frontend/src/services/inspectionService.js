import { apiClient, mockDelay, USE_REAL_API } from './apiClient';
import { store, nextId } from '../data/mockStore';

/** Maps directly to backend/src/routes/inspectionRoutes.js. */
export const inspectionService = {
  async list(params) {
    if (USE_REAL_API) return apiClient.get('/inspections', { params });
    await mockDelay(300);
    return { data: store.inspections, pagination: { total: store.inspections.length } };
  },
  async create(payload) {
    if (USE_REAL_API) return apiClient.post('/inspections', payload);
    await mockDelay(500);
    const inspection = { id: nextId('insp'), date: new Date().toISOString().slice(0, 10), ...payload };
    store.inspections.unshift(inspection);
    return inspection;
  },
};
