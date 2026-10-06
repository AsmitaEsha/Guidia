import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { limits } from '../middleware/rateLimits.js';
import { handler, ok, created, parse } from '../lib/http.js';
import { LANGUAGE_CODES } from '../config/languages.js';
import { ApiError } from '../middleware/errorHandler.js';
import { safetyService } from '../services/safetyService.js';
import { evaluateAction } from '../safety/riskEngine.js';
import { env } from '../config/env.js';

const router = Router();

const analyzeSchema = z.object({
  contentType: z.enum(['URL', 'SMS', 'MESSAGE']),
  content: z.string().trim().min(1, 'Please paste a link or message to check.').max(5000, 'That is too long to check.'),
  language: z.enum(LANGUAGE_CODES).optional(),
});

const summary = z.object({
  what: z.string().max(500),
  who: z.string().max(500),
  amountOrData: z.string().max(500),
  consequence: z.string().max(500),
});

const interceptionSchema = z.object({
  actionType: z.string().trim().min(1).max(100),
  summary,
  resolution: z.enum(['PROCEED', 'EDIT', 'HELP']),
});

const feedbackSchema = z.object({
  assessmentId: z.string().min(1).max(40),
  verdict: z.enum(['WARNING_SEEMS_WRONG', 'MISSED_A_SCAM', 'HELPFUL']),
});

const evaluateSchema = z.object({
  actionType: z.string().min(1).max(60),
  amountMinor: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).optional(),
});

router.use(requireAuth);

router.post('/analyze', limits.safety, handler(async (req, res) => {
  const body = parse(analyzeSchema, req.body);
  ok(res, await safetyService.analyze({ userId: req.user.id, ...body, requestId: req.id }));
}));

router.get('/history', handler(async (req, res) => {
  ok(res, { items: await safetyService.history(req.user.id) });
}));

router.post('/interceptions', handler(async (req, res) => {
  const body = parse(interceptionSchema, req.body);
  const record = await safetyService.logInterception({ userId: req.user.id, ...body, requestId: req.id });
  created(res, { id: record.id });
}));

router.get('/interceptions', handler(async (req, res) => {
  ok(res, { items: await safetyService.interceptionHistory(req.user.id) });
}));

router.post('/feedback', handler(async (req, res) => {
  const body = parse(feedbackSchema, req.body);
  const result = await safetyService.feedback({ userId: req.user.id, ...body, requestId: req.id });
  if (!result) throw new ApiError(404, 'That safety check was not found.', 'NOT_FOUND');
  ok(res, result);
}));

// Pure policy lookup — lets the UI explain what an action would require
// before the user starts it. Creates nothing.
router.post('/evaluate', handler(async (req, res) => {
  const body = parse(evaluateSchema, req.body);
  ok(res, evaluateAction({ ...body, sensitiveActionsDisabled: env.killSwitches.sensitiveActions }));
}));

export default router;
