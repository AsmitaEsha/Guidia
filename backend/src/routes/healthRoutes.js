import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { aiGateway } from '../ai/gateway.js';
import { mlClient } from '../ml/mlClient.js';
import { emailProvider } from '../notifications/providers/emailProvider.js';

const router = Router();

// Process is up. Never touches dependencies.
router.get('/live', (req, res) => {
  res.json({ success: true, data: { status: 'live', service: 'guidia-backend' } });
});

// Ready to serve: database reachable. Optional integrations are reported
// (so degraded mode is visible) but don't fail readiness. No AI calls here.
async function ready(req, res) {
  let database = 'down';
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = 'up';
  } catch {
    database = 'down';
  }
  const ml = await mlClient.health();
  const body = {
    status: database === 'up' ? 'ready' : 'not_ready',
    checks: {
      database,
      ai: aiGateway.isAvailable() ? 'configured' : 'not_configured',
      mlService: ml.status,
      email: emailProvider.isConfigured() ? 'configured' : 'not_configured',
    },
    environment: env.nodeEnv,
  };
  res.status(database === 'up' ? 200 : 503).json({ success: database === 'up', data: body });
}

router.get('/ready', ready);
// Back-compat: GET /api/health
router.get('/', ready);

export default router;
