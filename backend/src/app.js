import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { requestContext } from './middleware/requestContext.js';
import { isAllowedOrigin } from './middleware/originGuard.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import voiceRoutes from './routes/voiceRoutes.js';
import visionRoutes from './routes/visionRoutes.js';
import safetyRoutes from './routes/safetyRoutes.js';
import actionRoutes from './routes/actionRoutes.js';
import guardianRoutes from './routes/guardianRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import memoryRoutes from './routes/memoryRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import learningRoutes from './routes/learningRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import extensionRoutes from './routes/extensionRoutes.js';
import configRoutes from './routes/configRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

function apiRouter() {
  const api = express.Router();
  api.use('/health', healthRoutes);
  api.use('/config', configRoutes);
  api.use('/auth', authRoutes);
  api.use('/users', userRoutes);
  api.use('/assistant', assistantRoutes);
  api.use('/voice', voiceRoutes);
  api.use('/vision', visionRoutes);
  // Back-compat alias for the V1 extension and screenshot pages.
  api.use('/screenshots', visionRoutes);
  api.use('/safety', safetyRoutes);
  api.use('/actions', actionRoutes);
  api.use('/guardian', guardianRoutes);
  api.use('/guardians', guardianRoutes);
  api.use('/emergency', emergencyRoutes);
  api.use('/memory', memoryRoutes);
  api.use('/progress', progressRoutes);
  api.use('/learning', learningRoutes);
  api.use('/tasks', taskRoutes);
  api.use('/notifications', notificationRoutes);
  api.use('/extension', extensionRoutes);
  api.use('/admin', adminRoutes);
  return api;
}

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', env.isProduction ? 1 : false);

  app.use(requestContext);
  // Pure JSON/binary API: HTML-oriented helmet defaults (CSP, COOP) are off;
  // resources stay cross-origin because the web app is on another origin.
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({
    origin(origin, callback) {
      // No Origin header: same-origin, curl or server-to-server.
      if (!origin || isAllowedOrigin(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    exposedHeaders: ['X-Request-Id', 'Idempotent-Replay'],
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  const api = apiRouter();
  app.use('/api/v1', api);
  app.use('/api', api);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
