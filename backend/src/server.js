import 'dotenv/config';
import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log(`[server] AutoHubX API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });

    const shutdown = async (signal) => {
      console.log(`[server] Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[server] Shutdown complete.');
        process.exit(0);
      });
      // Force-exit if shutdown hangs.
      setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('unhandledRejection', (reason) => {
      console.error('[server] Unhandled promise rejection:', reason);
    });
  } catch (err) {
    console.error('[server] Failed to start:', err.message);
    process.exit(1);
  }
}

start();
