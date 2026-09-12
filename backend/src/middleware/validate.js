import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

/**
 * Runs after an array of express-validator checks and turns any failures
 * into a single, consistent 422 ApiError instead of leaking raw validator output.
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
  next(ApiError.unprocessable('Validation failed.', 'VALIDATION_ERROR', details));
}
