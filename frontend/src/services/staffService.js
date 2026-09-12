import { apiClient, mockDelay, USE_REAL_API } from './apiClient';
import { store, nextId } from '../data/mockStore';

/** Maps directly to backend/src/routes/mechanicRoutes.js + userRoutes.js (staff). */
export const staffService = {
  async listMechanics(params) {
    if (USE_REAL_API) return apiClient.get('/mechanics', { params });
    await mockDelay(350);
    return { data: store.mechanics, pagination: { total: store.mechanics.length } };
  },
  async updateMechanic(id, payload) {
    if (USE_REAL_API) return apiClient.patch(`/mechanics/${id}`, payload);
    await mockDelay(400);
    store.mechanics = store.mechanics.map((m) => (m.id === id ? { ...m, ...payload } : m));
    return store.mechanics.find((m) => m.id === id);
  },
  async createMechanic(payload) {
    if (USE_REAL_API) {
      const res = await apiClient.post('/users/staff', { ...payload, role: 'mechanic' });
      return res.data; // { user, tempPassword }
    }
    await mockDelay(450);
    const mechanic = { id: nextId('mech'), activeJobs: 0, isAvailable: true, status: 'Active', specializations: [], ...payload };
    store.mechanics.unshift(mechanic);
    return { user: mechanic, tempPassword: 'demo-password' };
  },
  async listReceptionists(params) {
    if (USE_REAL_API) return apiClient.get('/users', { params: { ...params, role: 'receptionist' } });
    await mockDelay(350);
    return { data: store.receptionists, pagination: { total: store.receptionists.length } };
  },
  async createReceptionist(payload) {
    if (USE_REAL_API) {
      const res = await apiClient.post('/users/staff', { ...payload, role: 'receptionist' });
      return res.data; // { user, tempPassword }
    }
    await mockDelay(450);
    const receptionist = { id: nextId('r'), status: 'Active', joined: new Date().toISOString().slice(0, 10), ...payload };
    store.receptionists.unshift(receptionist);
    return { user: receptionist, tempPassword: 'demo-password' };
  },
  async deactivate(id) {
    if (USE_REAL_API) return apiClient.patch(`/users/${id}/deactivate`);
    await mockDelay(350);
    return { success: true };
  },
};
