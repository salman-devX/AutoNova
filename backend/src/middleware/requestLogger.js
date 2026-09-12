/**
 * Minimal structured request logger. In production you'd typically swap this
 * for pino/winston shipped to a log aggregator — kept dependency-free here.
 * Never logs Authorization headers, request bodies, or secrets.
 */
export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const line = `${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`;
    if (res.statusCode >= 500) console.error(line);
    else if (res.statusCode >= 400) console.warn(line);
    else console.log(line);
  });
  next();
}
