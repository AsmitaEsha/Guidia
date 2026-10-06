import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { limits } from '../middleware/rateLimits.js';
import { handler, ok, parse } from '../lib/http.js';
import { LANGUAGE_CODES } from '../config/languages.js';
import { env } from '../config/env.js';
import { aiGateway } from '../ai/gateway.js';
import { handleAssistantTurn } from '../ai/orchestrator.js';
import { conversationService } from '../services/conversationService.js';

const router = Router();

const messageSchema = z.object({
  message: z.string().trim().min(1, 'Please type a question.').max(2000, 'That message is too long.'),
  conversationId: z.string().max(40).optional(),
  cognitiveState: z.enum(['CALM', 'UNSURE', 'SCARED']).optional(),
  language: z.enum(LANGUAGE_CODES).optional(),
  source: z.enum(['TEXT', 'VOICE']).optional(),
});

router.use(requireAuth);

router.get('/status', (req, res) => {
  ok(res, { available: aiGateway.isAvailable() && !env.killSwitches.aiChat, provider: aiGateway.providerName() });
});

router.post('/message', limits.assistant, handler(async (req, res) => {
  const body = parse(messageSchema, req.body);
  const result = await handleAssistantTurn({ ...body, userId: req.user.id, requestId: req.id });
  ok(res, result);
}));

router.get('/conversations', handler(async (req, res) => {
  ok(res, { conversations: await conversationService.list(req.user.id) });
}));

router.get('/conversations/:id', handler(async (req, res) => {
  ok(res, { conversation: await conversationService.get(req.user.id, req.params.id) });
}));

router.delete('/conversations/:id', handler(async (req, res) => {
  await conversationService.remove(req.user.id, req.params.id);
  res.status(204).end();
}));

export default router;
