import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
  sendPasswordResetEmail, confirmPasswordReset, sendEmailVerification,
  signInWithPopup, onAuthStateChanged,
} from 'firebase/auth';
import { apiClient } from './apiClient';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';

/**
 * Real authentication only: Firebase Authentication (identity) + the
 * AutoHubX backend (role/workshop/profile). There is no mock/demo mode —
 * `frontend/.env` must have VITE_API_URL and the VITE_FIREBASE_* keys set,
 * or every call below will fail with a clear "not configured" error.
 */
function assertConfigured() {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Firebase is not configured. Set VITE_FIREBASE_* and VITE_API_URL in frontend/.env.'
    );
  }
}

/** After any Firebase sign-in, fetches (or, for a first-time Google user, creates then fetches) the MongoDB profile. */
async function resolveProfile() {
  try {
    const { data } = await apiClient.get('/auth/me');
    return data;
  } catch (err) {
    // Brand-new Google sign-in: no MongoDB user yet — create it, then retry.
    if (err.statusCode === 401) {
      await apiClient.post('/auth/register', {});
      const { data } = await apiClient.get('/auth/me');
      return data;
    }
    throw err;
  }
}

export const authService = {
  async login({ email, password }) {
    assertConfigured();
    await signInWithEmailAndPassword(auth, email, password);
    return resolveProfile();
  },

  async loginWithGoogle() {
    assertConfigured();
    await signInWithPopup(auth, googleProvider);
    return resolveProfile();
  },

  async register({ name, email, password, phone, turnstileToken }) {
    assertConfigured();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(credential.user);
    const { data } = await apiClient.post('/auth/register', { name, phone, turnstileToken });
    return data;
  },

  /** Same idea as register(), but for the "Continue with Google" button on the sign-up page. */
  async registerWithGoogle() {
    assertConfigured();
    await signInWithPopup(auth, googleProvider);
    return resolveProfile();
  },

  async forgotPassword(email) {
    assertConfigured();
    await sendPasswordResetEmail(auth, email);
    return { sent: true };
  },

  async resetPassword(oobCode, newPassword) {
    assertConfigured();
    await confirmPasswordReset(auth, oobCode, newPassword);
    return { success: true };
  },

  async logout() {
    assertConfigured();
    await signOut(auth);
    return { success: true };
  },

  /** Resolves the current session on page load via Firebase's own listener. */
  onAuthStateChanged(callback) {
    if (!isFirebaseConfigured) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return callback(null);
      try {
        callback(await resolveProfile());
      } catch {
        callback(null);
      }
    });
  },

  isRealAuth: true,
};
