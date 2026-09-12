import { apiClient, mockDelay, USE_REAL_API } from './apiClient';
import { mockNotifications } from '../data/mockNotifications';

let store = [...mockNotifications];

/** Maps directly to backend/src/routes/notificationRoutes.js. */
export const notificationService = {
  async getNotifications() {
    if (USE_REAL_API) {
      const res = await apiClient.get('/notifications');
      return res.data;
    }
    await mockDelay(300);
    return store;
  },
  async markAsRead(id) {
    if (USE_REAL_API) {
      const res = await apiClient.patch(`/notifications/${id}/read`);
      return res.data;
    }
    await mockDelay(150);
    store = store.map((n) => (n.id === id ? { ...n, read: true } : n));
    return store;
  },
  async markAllAsRead() {
    if (USE_REAL_API) {
      await apiClient.patch('/notifications/read-all');
      return this.getNotifications();
    }
    await mockDelay(200);
    store = store.map((n) => ({ ...n, read: true }));
    return store;
  },
};
