import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { idempotent } from '../middleware/idempotency.js';
import { handler, ok, created, parse } from '../lib/http.js';
import { actionService } from '../services/actionService.js';
import { ACTION_TYPES } from '../safety/actionTypes.js';

const router = Router();

const createSchema = z.object({
  applicationSlug: z.string().min(1).max(40),
  actionType: z.enum(Object.keys(ACTION_TYPES)),
  recipientLabel: z.string().trim().max(120).optional(),
  amount: z.number().positive().max(100_000_000).optional(),
  currency: z.string().length(3).optional(),
  taskSessionId: z.string().max(40).optional(),
  newRecipient: z.boolean().optional(),
});

const versionSchema = z.object({ version: z.number().int().nonnegative().optional() });

router.use(requireAuth);

// Sensitive-action flow (simulation only):
//   POST /actions            → REVIEW (Safety Engine decides confirmations/guardian)
//   POST /actions/:id/confirm → one explicit confirmation per call
//   POST /actions/:id/cancel
router.post('/', idempotent(), handler(async (req, res) => {
  const body = parse(createSchema, req.body);
  created(res, await actionService.create(req.user.id, body, { requestId: req.id }));
}));

router.get('/accounts', handler(async (req, res) => ok(res, { accounts: await actionService.simulationAccounts(req.user.id) })));

router.get('/:id', handler(async (req, res) => ok(res, { proposal: await actionService.get(req.user.id, req.params.id) })));

router.post('/:id/confirm', idempotent({ required: true }), handler(async (req, res) => {
  const { version } = parse(versionSchema, req.body ?? {});
  ok(res, { proposal: await actionService.confirm(req.user.id, req.params.id, { version }, { requestId: req.id }) });
}));

router.post('/:id/cancel', idempotent(), handler(async (req, res) => {
  ok(res, { proposal: await actionService.cancel(req.user.id, req.params.id, { requestId: req.id }) });
}));

export default router;
