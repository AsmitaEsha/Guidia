import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { limits } from '../middleware/rateLimits.js';
import { idempotent } from '../middleware/idempotency.js';
import { handler, ok, created, parse } from '../lib/http.js';
import { emergencyService } from '../services/emergencyService.js';

const router = Router();

const createSchema = z.object({
  reason: z.enum(['I_AM_CONFUSED', 'I_THINK_THIS_IS_UNSAFE', 'I_MAY_HAVE_MADE_A_MISTAKE', 'PAYMENT_HELP', 'APPOINTMENT_HELP', 'OTHER']),
  message: z.string().trim().max(500).optional(),
  taskSessionId: z.string().max(40).optional(),
});

router.use(requireAuth);

router.post('/', limits.emergency, idempotent(), handler(async (req, res) => {
  const body = parse(createSchema, req.body);
  const event = await emergencyService.create(req.user.id, body, { requestId: req.id });
  (event.deduplicated ? ok : created)(res, { event });
}));

router.get('/', handler(async (req, res) => ok(res, { events: await emergencyService.listMine(req.user.id) })));
router.get('/incoming', handler(async (req, res) => ok(res, { events: await emergencyService.listIncoming(req.user.id) })));

for (const action of ['acknowledge', 'contacted', 'resolve', 'cancel']) {
  router.post(`/:id/${action}`, idempotent(), handler(async (req, res) => {
    ok(res, { event: await emergencyService.transition(req.user.id, req.params.id, action, { requestId: req.id }) });
  }));
}

export default router;
