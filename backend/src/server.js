import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { startWorker, stopWorker } from './jobs/worker.js';
import { logger } from './lib/logger.js';

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info('Guidia backend listening', { port: env.port, env: env.nodeEnv });
  startWorker();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${env.port} is already in use — another Guidia API (or another program) is running. Stop it, or set PORT in backend/.env, then start again.`);
  } else {
    logger.error('Server failed to start', { message: err.message });
  }
  process.exit(1);
});

async function shutdown(signal) {
  logger.info('shutting down', { signal });
  stopWorker();
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
