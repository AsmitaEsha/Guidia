import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { idempotent } from '../middleware/idempotency.js';
import { handler, ok, parse } from '../lib/http.js';
import { LANGUAGE_CODES } from '../config/languages.js';
import { learningService } from '../services/learningService.js';

const router = Router();

const completeSchema = z.object({
  // Self-reported comfort 1–5 ("How did that feel?"). Optional.
  confidence: z.number().int().min(1).max(5).optional(),
  language: z.enum(LANGUAGE_CODES).optional(),
});

router.use(requireAuth);

router.get('/applications', handler(async (req, res) => ok(res, { applications: await learningService.applications() })));

router.get('/lessons', handler(async (req, res) => {
  const domain = typeof req.query.domain === 'string' ? req.query.domain : undefined;
  ok(res, { lessons: await learningService.lessons({ domain }) });
}));

router.get('/lessons/:slug', handler(async (req, res) => ok(res, { lesson: await learningService.lesson(req.params.slug) })));

router.post('/lessons/:slug/complete', idempotent(), handler(async (req, res) => {
  const body = parse(completeSchema, req.body ?? {});
  ok(res, await learningService.completeLesson(req.user.id, req.params.slug, body));
}));

router.get('/scenarios', handler(async (req, res) => {
  const application = typeof req.query.application === 'string' ? req.query.application : undefined;
  ok(res, { scenarios: await learningService.scenarios({ application }) });
}));

export default router;
