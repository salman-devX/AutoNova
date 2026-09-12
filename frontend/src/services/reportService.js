import { apiClient } from './apiClient';

/** Maps to backend/src/routes/reportRoutes.js (mounted at /api/dashboard). */
export const reportService = {
  async getAdminDashboard() {
    const res = await apiClient.get('/dashboard/admin');
    return res.data;
  },
  async getReceptionistDashboard() {
    const res = await apiClient.get('/dashboard/receptionist');
    return res.data;
  },
  async getMechanicDashboard() {
    const res = await apiClient.get('/dashboard/mechanic');
    return res.data;
  },
  async getCustomerDashboard() {
    const res = await apiClient.get('/dashboard/customer');
    return res.data;
  },
};