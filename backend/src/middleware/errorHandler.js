import { ApiError } from '../utils/ApiError.js';

export function notFound(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
}

/**
 * MUST be the last middleware registered in app.js.
 * Normalizes every thrown error — operational or not — into the
 * { success:false, message, code } response shape, and NEVER leaks
 * stack traces, DB internals, or secrets in production.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';
  let details = err.details;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    message = 'Validation failed.';
  }

  // Mongoose invalid ObjectId cast
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid value for field "${err.path}".`;
  }

  // MongoDB duplicate key error (E11000) — covers unique indexes,
  // including the appointment double-booking guard.
  if (err.code === 11000) {
    statusCode = 409;
    code = err.keyPattern?.start ? 'APPOINTMENT_CONFLICT' : 'DUPLICATE_KEY';
    const field = Object.keys(err.keyPattern || {}).join(', ');
    message = code === 'APPOINTMENT_CONFLICT'
      ? 'This time slot is no longer available.'
      : `A record with this ${field} already exists.`;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  if (!err.isOperational && !isProduction) {
    // eslint-disable-next-line no-console
    console.error('[unhandled error]', err);
  } else if (!err.isOperational) {
    // eslint-disable-next-line no-console
    console.error('[unhandled error]', err.message);
  }

  const payload = { success: false, message, code };
  if (details) payload.details = details;
  if (!isProduction && !err.isOperational) payload.stack = err.stack;

  res.status(statusCode).json(payload);
}
