import { ApiError } from '../utils/ApiError.js';

/**
 * Resolves req.tenantId — the ONLY workshopId value the rest of the request
 * pipeline should trust.
 *
 * - receptionist / mechanic: always forced to their own user.workshopId.
 *   Any workshopId in the query/body is silently ignored for scoping purposes.
 * - admin: may explicitly operate on a specific workshop via ?workshopId=
 *   (e.g. "view Workshop B's dashboard"), but if omitted, falls back to their
 *   own workshopId if set, or null for cross-workshop/global views.
 * - customer: has no single tenant — their access is scoped by *ownership*
 *   (customerId) in the service layer instead, not by workshopId alone.
 */
export function resolveTenant(req, res, next) {
  const { user } = req;
  if (!user) return next(ApiError.unauthorized('Authentication required.'));

  if (user.role === 'admin') {
    const requested = req.query.workshopId || req.body?.workshopId;
    req.tenantId = requested || user.workshopId || null;
  } else if (user.role === 'receptionist' || user.role === 'mechanic') {
    if (!user.workshopId) {
      return next(ApiError.forbidden('This account is not assigned to a workshop.'));
    }
    req.tenantId = user.workshopId.toString();
  } else {
    // customer — no forced single-tenant scope; ownership checks apply instead.
    req.tenantId = null;
  }

  next();
}

/** Use on routes that cannot function without a concrete workshop scope. */
export function requireTenant(req, res, next) {
  if (!req.tenantId) {
    return next(ApiError.badRequest('A workshopId is required for this request.', 'WORKSHOP_REQUIRED'));
  }
  next();
}
