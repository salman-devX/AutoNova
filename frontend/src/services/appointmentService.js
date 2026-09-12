import { apiClient, mockDelay, USE_REAL_API } from './apiClient';
import { store, nextId } from '../data/mockStore';

function mockAvailabilitySlots(date) {
  const base = new Date(date);
  base.setHours(9, 0, 0, 0);
  const slots = [];
  for (let i = 0; i < 16; i++) {
    const start = new Date(base.getTime() + i * 30 * 60000);
    slots.push({ start: start.toISOString(), available: ![3, 4, 9].includes(i) });
  }
  return slots;
}

/** Maps directly to backend/src/routes/appointmentRoutes.js. */
export const appointmentService = {
  async list(params) {
    if (USE_REAL_API) return apiClient.get('/appointments', { params });
    await mockDelay(350);
    return { data: store.appointments, pagination: { total: store.appointments.length } };
  },
  async getById(id) {
    if (USE_REAL_API) return apiClient.get(`/appointments/${id}`);
    await mockDelay(250);
    return store.appointments.find((a) => a.id === id) || null;
  },
  async getAvailability(params) {
    if (USE_REAL_API) {
      const res = await apiClient.get('/appointments/availability', { params });
      return res.data; // backend wraps the payload as { success, message, data: { date, slots } }
    }
    await mockDelay(400);
    return { date: params.date, slots: mockAvailabilitySlots(params.date) };
  },
  async create(payload) {
    if (USE_REAL_API) return apiClient.post('/appointments', payload);
    await mockDelay(500);
    const appointment = {
      id: nextId('a'), status: 'Pending',
      customer: 'You', vehicle: payload.vehicleLabel, service: payload.serviceLabel,
      date: payload.date, time: payload.time,
    };
    store.appointments.unshift(appointment);
    return appointment;
  },
  async cancel(id, reason) {
    if (USE_REAL_API) return apiClient.post(`/appointments/${id}/cancel`, { reason });
    await mockDelay(350);
    store.appointments = store.appointments.map((a) => (a.id === id ? { ...a, status: 'Cancelled' } : a));
    return { success: true };
  },
  async confirm(id) {
    if (USE_REAL_API) return apiClient.patch(`/appointments/${id}/confirm`);
    await mockDelay(350);
    store.appointments = store.appointments.map((a) => (a.id === id ? { ...a, status: 'Confirmed' } : a));
    return { success: true };
  },
  async reschedule(id, start) {
    if (USE_REAL_API) return apiClient.post(`/appointments/${id}/reschedule`, { start });
    await mockDelay(400);
    return { success: true };
  },
};