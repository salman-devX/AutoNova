import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let firebaseApp = null;
let initialized = false;

/**
 * Lazily initializes firebase-admin using service-account env vars.
 * Keeping this lazy (rather than at import time) means the rest of the app
 * can still boot — and unrelated routes/tests can still run — even in
 * environments where Firebase credentials aren't configured yet.
 *
 * Note: firebase-admin v12+ dropped the old `admin.credential.cert()` /
 * `admin.auth()` namespace API from its default ESM export — it now only
 * exposes the modular functions imported above.
 */
export function getFirebaseAdmin() {
  if (!initialized) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // Private keys in .env are usually stored with literal \n sequences.
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Firebase credentials are not configured. Set FIREBASE_PROJECT_ID, ' +
        'FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in your .env file.'
      );
    }

    firebaseApp = getApps().length
      ? getApps()[0]
      : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    initialized = true;
  }
  return { auth: () => getAuth(firebaseApp) };
}

/** Verifies a Firebase ID token and returns its decoded claims. */
export async function verifyFirebaseToken(idToken) {
  const firebaseAdmin = getFirebaseAdmin();
  return firebaseAdmin.auth().verifyIdToken(idToken);
}
