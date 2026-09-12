import axios from 'axios';
import { auth, isFirebaseConfigured } from '../config/firebase';

/**
 * USE_REAL_API is the single switch between "talk to the real AutoHubX backend"
 * and "use the original in-memory mock services". It's on when a backend URL
 * is configured — set VITE_API_URL (and the VITE_FIREBASE_* vars) in .env to
 * activate it. Left off, the app behaves exactly as it did in Phase 1.
 */
export const USE_REAL_API = Boolean(import.meta.env.VITE_API_URL);

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  if (isFirebaseConfigured && auth?.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res.data,
  (error) => {
    // Normalizes both Axios-level failures and our backend's { success:false, message, code } shape
    // into a single Error the UI can read `.message` from either way.
    const payload = error?.response?.data;
    const message = payload?.message || error.message || 'Something went wrong. Please try again.';
    const normalized = new Error(message);
    normalized.code = payload?.code;
    normalized.statusCode = error?.response?.status;
    normalized.details = payload?.details;
    return Promise.reject(normalized);
  }
);

/** Simulates network latency for mock services so loading states stay visible in demo mode. */
export const mockDelay = (ms = 500) => new Promise((res) => setTimeout(res, ms));
