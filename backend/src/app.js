import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { sanitizeRequest } from './middleware/sanitize.js';

import routes from './routes/index.js';
import { requestLogger } from './middleware/requestLogger.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1); // required for correct req.ip behind Render/Railway/Vercel proxies

  // Secure CORS: only the configured frontend origin(s) may call the API.
  // Trailing slashes are stripped so a stray "/" in the env var (which the
  // browser's Origin header never includes) doesn't silently break matching.
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''));

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    })
  );

  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(sanitizeRequest); // strips $/. operators from req.body/query/params to block NoSQL injection
  app.use(requestLogger);
  app.use('/api', apiLimiter);

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp;
