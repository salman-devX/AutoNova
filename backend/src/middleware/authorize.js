import { ApiError } from '../utils/ApiError.js';

/**
 * Usage: router.get('/admin-only', authenticate, authorize('admin'), handler)
 * Must run after authenticate() so req.user is populated.
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Role "${req.user.role}" is not permitted to perform this action.`));
    }
    next();
  };
}
