import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { limits } from '../middleware/rateLimits.js';
import { idempotent } from '../middleware/idempotency.js';
import { handler, ok, created, parse } from '../lib/http.js';
import { emergencyService } from '../services/emergencyService.js';
import { emergencyContactService } from '../services/emergencyContactService.js';

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

// The people a learner wants to reach when they need help.
const contactSchema = z.object({
  name: z.string().trim().min(1, 'Please enter a name.').max(80),
  relationship: z.string().trim().max(40).optional().or(z.literal('')),
  phone: z.string().trim().max(24).regex(/^[+\d][\d\s()-]{5,22}$/, 'Please enter a phone number with digits only.').optional().or(z.literal('')),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.').optional().or(z.literal('')),
  isPrimary: z.boolean().optional(),
}).refine((c) => c.phone || c.email, { message: 'Please add a phone number or an email so they can be reached.', path: ['phone'] });

router.get('/contacts', handler(async (req, res) => ok(res, { contacts: await emergencyContactService.list(req.user.id) })));
router.post('/contacts', handler(async (req, res) => created(res, { contact: await emergencyContactService.create(req.user.id, parse(contactSchema, req.body)) })));
router.put('/contacts/:id', handler(async (req, res) => ok(res, { contact: await emergencyContactService.update(req.user.id, req.params.id, parse(contactSchema, req.body)) })));
router.delete('/contacts/:id', handler(async (req, res) => { await emergencyContactService.remove(req.user.id, req.params.id); ok(res, { removed: true }); }));

router.get('/', handler(async (req, res) => ok(res, { events: await emergencyService.listMine(req.user.id) })));
router.get('/incoming', handler(async (req, res) => ok(res, { events: await emergencyService.listIncoming(req.user.id) })));

for (const action of ['acknowledge', 'contacted', 'resolve', 'cancel']) {
  router.post(`/:id/${action}`, idempotent(), handler(async (req, res) => {
    ok(res, { event: await emergencyService.transition(req.user.id, req.params.id, action, { requestId: req.id }) });
  }));
}

export default router;
