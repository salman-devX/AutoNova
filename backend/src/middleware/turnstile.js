import { verifyTurnstileToken } from '../config/turnstile.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Apply to public endpoints (registration, login, appointment booking,
 * contact forms). Requires the client to submit `turnstileToken` in the body.
 * Verification always happens server-side — a frontend-only check is never trusted.
 */
export const verifyTurnstile = asyncHandler(async (req, res, next) => {
  const hasSecretConfigured = Boolean(process.env.TURNSTILE_SECRET_KEY);
  if (
    process.env.NODE_ENV === 'test' ||
    process.env.TURNSTILE_DISABLED === 'true' ||
    !hasSecretConfigured
  ) {
    // Allows automated tests / local dev / deployments that haven't set up
    // Cloudflare Turnstile yet — bot-protection simply turns itself back on
    // the moment TURNSTILE_SECRET_KEY is filled in, no other change needed.
    return next();
  }

  const token = req.body?.turnstileToken;
  if (!token) {
    throw ApiError.badRequest('Missing bot-protection token.', 'TURNSTILE_TOKEN_MISSING');
  }

  const result = await verifyTurnstileToken(token, req.ip);
  if (!result.success) {
    throw ApiError.forbidden('Bot protection check failed. Please try again.', 'TURNSTILE_FAILED');
  }

  next();
});
