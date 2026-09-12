import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

/**
 * Only initializes when VITE_FIREBASE_API_KEY is actually configured.
 * This is a real-auth-only app now — if these env vars aren't set,
 * authService.js throws a clear "not configured" error instead of a
 * confusing failure deep inside a Firebase/API call.
 */
export const isFirebaseConfigured = Boolean(import.meta.env.VITE_FIREBASE_API_KEY);

let app = null;
let auth = null;

if (isFirebaseConfigured) {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  app = getApps().length ? getApps()[0] : initializeApp(config);
  auth = getAuth(app);
}

export { app, auth };
export const googleProvider = new GoogleAuthProvider();
