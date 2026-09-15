import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import safetyRoutes from './routes/safetyRoutes.js';
import guardianRoutes from './routes/guardianRoutes.js';
import memoryRoutes from './routes/memoryRoutes.js';
import voiceRoutes from './routes/voiceRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import screenshotRoutes from './routes/screenshotRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

export function createApp() {
  const app = express();

  // This is a pure JSON/binary API (no HTML served), so the HTML-oriented
  // parts of helmet's defaults (CSP, COOP) are switched off; the resource
  // policy stays cross-origin since the frontend is intentionally on a
  // different origin/port.
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  if (env.nodeEnv !== 'test') {
    app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
  }

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'guidia-backend' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/assistant', assistantRoutes);
  app.use('/api/safety', safetyRoutes);
  app.use('/api/guardians', guardianRoutes);
  app.use('/api/memory', memoryRoutes);
  app.use('/api/voice', voiceRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/screenshots', screenshotRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
