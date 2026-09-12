import { verifyFirebaseToken } from '../config/firebase.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Verifies the Firebase ID token on every protected request and resolves
 * the corresponding MongoDB User record onto req.user.
 *
 * Frontend flow: Firebase Auth -> ID token -> `Authorization: Bearer <token>`.
 * We NEVER trust a role/workshopId sent by the client — both come from
 * the MongoDB User record looked up by the verified firebaseUid.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Missing or malformed Authorization header.');
  }

  let decoded;
  try {
    decoded = await verifyFirebaseToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired authentication token.');
  }

  const user = await User.findOne({ firebaseUid: decoded.uid });
  if (!user) {
    throw ApiError.unauthorized('No account found for this authenticated identity.');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated.');
  }

  req.user = user;
  req.firebaseClaims = decoded;
  next();
});

/**
 * Verifies the Firebase ID token but — unlike authenticate() — does NOT
 * require a matching MongoDB user to already exist. This is exactly what
 * POST /auth/register needs: at that point the Firebase account was just
 * created and the MongoDB profile doesn't exist yet, so requiring it here
 * would make registration impossible (this was the bug: every /register
 * call used to fail with "No account found", because `authenticate` was
 * reused for it). Use this only on the register route.
 */
export const verifyIdentity = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Missing or malformed Authorization header.');
  }

  try {
    req.firebaseClaims = await verifyFirebaseToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired authentication token.');
  }
  next();
});

/**
 * Same as authenticate(), but does not fail the request when no/invalid token
 * is present — useful for endpoints that behave differently for guests vs. users
 * (none currently required, kept for extensibility).
 */
export const authenticateOptional = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next();

  try {
    const decoded = await verifyFirebaseToken(token);
    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (user?.isActive) {
      req.user = user;
      req.firebaseClaims = decoded;
    }
  } catch {
    // Silently ignore — this route doesn't require authentication.
  }
  next();
});
