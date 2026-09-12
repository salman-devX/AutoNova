import { apiClient, mockDelay, USE_REAL_API } from './apiClient';
import { store } from '../data/mockStore';

const NEXT_STATUS = {
  booked: 'vehicle_received', vehicle_received: 'inspection', inspection: 'in_progress',
  in_progress: 'quality_check', quality_check: 'ready_for_pickup', ready_for_pickup: 'completed',
};

/** Maps directly to backend/src/routes/serviceOrderRoutes.js. */
export const serviceOrderService = {
  async list(params) {
    if (USE_REAL_API) return apiClient.get('/service-orders', { params });
    await mockDelay(350);
    return { data: store.serviceOrders, pagination: { total: store.serviceOrders.length } };
  },
  async getById(id) {
    if (USE_REAL_API) return apiClient.get(`/service-orders/${id}`);
    await mockDelay(250);
    return store.serviceOrders.find((o) => o.id === id) || null;
  },
  async create(payload) {
    if (USE_REAL_API) return apiClient.post('/service-orders', payload);
    await mockDelay(500);
    return { success: true };
  },
  async update(id, payload) {
    if (USE_REAL_API) return apiClient.patch(`/service-orders/${id}`, payload);
    await mockDelay(400);
    return { success: true };
  },
  /** Advances to the next lifecycle stage — mirrors the backend's status-transition map. */
  async advanceStatus(id, currentStatus) {
    if (USE_REAL_API) {
      return apiClient.post(`/service-orders/${id}/status`, { status: NEXT_STATUS[currentStatus] });
    }
    await mockDelay(400);
    store.serviceOrders = store.serviceOrders.map((o) =>
      o.id === id ? { ...o, status: NEXT_STATUS[o.status] || o.status } : o
    );
    return store.serviceOrders.find((o) => o.id === id);
  },
  async addParts(id, items) {
    if (USE_REAL_API) return apiClient.post(`/service-orders/${id}/parts`, { items });
    await mockDelay(400);
    return { success: true };
  },
  async assignMechanics(id, mechanicIds) {
    if (USE_REAL_API) return apiClient.post(`/service-orders/${id}/assign-mechanics`, { mechanicIds });
    await mockDelay(400);
    return { success: true };
  },
};

export const NEXT_STATUS_MAP = NEXT_STATUS;
