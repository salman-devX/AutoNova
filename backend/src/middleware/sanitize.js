/**
 * Strips MongoDB operator keys ($gt, $where, etc.) and dotted keys from
 * request input to block NoSQL injection — same goal as express-mongo-sanitize,
 * but written to mutate objects IN PLACE.
 *
 * Why not express-mongo-sanitize: it reassigns `req.query = <sanitized copy>`,
 * which throws "Cannot set property query of #<IncomingMessage> which has
 * only a getter" under Express 5 (req.query is now a read-only getter computed
 * from req.url). Mutating the existing object's keys works fine instead.
 */
function sanitizeInPlace(value) {
  if (!value || typeof value !== 'object') return value;

  if (Array.isArray(value)) {
    value.forEach((item) => sanitizeInPlace(item));
    return value;
  }

  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete value[key];
      continue;
    }
    sanitizeInPlace(value[key]);
  }
  return value;
}

export function sanitizeRequest(req, res, next) {
  sanitizeInPlace(req.body);
  sanitizeInPlace(req.params);
  sanitizeInPlace(req.query); // mutated in place — never reassigned (Express 5 getter-only)
  next();
}
