import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { idempotent } from '../middleware/idempotency.js';
import { handler, ok, created, parse } from '../lib/http.js';
import { LANGUAGE_CODES } from '../config/languages.js';
import { INTENTS } from '../ai/intents.js';
import { taskService } from '../services/taskService.js';
import { learningService } from '../services/learningService.js';

const router = Router();

const startSchema = z.object({
  scenarioSlug: z.string().max(80).optional(),
  lessonSlug: z.string().max(80).optional(),
  applicationSlug: z.string().max(40).optional(),
  goal: z.enum(INTENTS).optional(),
  language: z.enum(LANGUAGE_CODES).optional(),
});

const actionSchema = z.object({
  action: z.string().min(1).max(80),
  version: z.number().int().nonnegative().optional(),
});

const completeSchema = z.object({
  outcome: z.enum(['SUCCESS', 'ABANDONED']).optional(),
  confidence: z.number().int().min(1).max(5).optional(),
  language: z.enum(LANGUAGE_CODES).optional(),
});

router.use(requireAuth);

// GuidedTaskSession: the shared context chat, voice, screenshots, practice,
// safety and guardians attach to. Survives refreshes and device switches.
router.post('/', handler(async (req, res) => created(res, { task: await taskService.start(req.user.id, parse(startSchema, req.body)) })));
router.get('/active', handler(async (req, res) => ok(res, { task: await taskService.active(req.user.id) })));
router.get('/:id', handler(async (req, res) => ok(res, { task: taskService.toPublic(await taskService.getOwned(req.user.id, req.params.id)) })));
router.get('/:id/events', handler(async (req, res) => ok(res, { events: await taskService.events(req.user.id, req.params.id) })));
router.post('/:id/actions', handler(async (req, res) => ok(res, await taskService.recordAction(req.user.id, req.params.id, parse(actionSchema, req.body)))));
router.post('/:id/hint', handler(async (req, res) => ok(res, await taskService.hint(req.user.id, req.params.id))));
router.post('/:id/pause', handler(async (req, res) => ok(res, { task: await taskService.setStatus(req.user.id, req.params.id, 'PAUSED', 'TASK_PAUSED') })));
router.post('/:id/resume', handler(async (req, res) => ok(res, { task: await taskService.setStatus(req.user.id, req.params.id, 'ACTIVE', 'TASK_RESUMED') })));
router.post('/:id/complete', idempotent(), handler(async (req, res) => {
  const body = parse(completeSchema, req.body ?? {});
  ok(res, await learningService.completeTask(req.user.id, req.params.id, body));
}));

export default router;
