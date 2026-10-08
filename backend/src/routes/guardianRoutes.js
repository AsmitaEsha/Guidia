import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { limits } from '../middleware/rateLimits.js';
import { idempotent } from '../middleware/idempotency.js';
import { handler, ok, created, parse } from '../lib/http.js';
import { guardianService } from '../services/guardianService.js';
import { ALL_SCOPES } from '../services/guardianAccess.js';

const router = Router();
const scope = z.enum(ALL_SCOPES);

const inviteSchema = z.object({
  guardianEmail: z.string().trim().toLowerCase().email('Please enter a valid email address.'),
  // Major currency units (e.g. taka); stored as minor units.
  approvalThreshold: z.number().nonnegative().max(10_000_000).optional(),
  role: z.enum(['PRIMARY', 'SECONDARY']).optional(),
  permissions: z.array(scope).max(ALL_SCOPES.length).optional(),
});

const permissionsSchema = z.object({
  permissions: z.array(scope).max(ALL_SCOPES.length),
  approvalThreshold: z.number().nonnegative().max(10_000_000).optional(),
});

const resolveSchema = z.object({ status: z.enum(['APPROVED', 'REJECTED', 'FLAGGED']) });

router.use(requireAuth, limits.guardian);

router.get('/', handler(async (req, res) => ok(res, await guardianService.list(req.user.id))));

// Family codes: the learner shares one; a family member enters it to connect.
router.get('/family-code', handler(async (req, res) => ok(res, await guardianService.familyCode(req.user.id))));
router.post('/family-code', handler(async (req, res) => ok(res, await guardianService.familyCode(req.user.id, { renew: true }))));
router.post('/link', handler(async (req, res) => {
  const { code } = parse(z.object({ code: z.string().trim().min(4, 'Please enter the family code.').max(12) }), req.body);
  created(res, { relationship: await guardianService.linkWithCode(req.user.id, code, { requestId: req.id }) });
}));

router.post('/invite', handler(async (req, res) => {
  const body = parse(inviteSchema, req.body);
  const relationship = await guardianService.invite(req.user.id, {
    ...body,
    approvalThreshold: body.approvalThreshold != null ? Math.round(body.approvalThreshold * 100) : 0,
  }, { requestId: req.id });
  created(res, { relationship });
}));

router.post('/:id/accept', handler(async (req, res) => {
  ok(res, { relationship: await guardianService.accept(req.params.id, req.user.id, { requestId: req.id }) });
}));

router.post('/:id/revoke', handler(async (req, res) => {
  ok(res, { relationship: await guardianService.revoke(req.params.id, req.user.id, { requestId: req.id }) });
}));

router.put('/:id/permissions', handler(async (req, res) => {
  const { permissions, approvalThreshold } = parse(permissionsSchema, req.body);
  const relationship = await guardianService.setPermissions(req.params.id, req.user.id, permissions, {
    approvalThreshold: approvalThreshold != null ? Math.round(approvalThreshold * 100) : undefined,
    requestId: req.id,
  });
  ok(res, { relationship });
}));

router.get('/approvals/mine', handler(async (req, res) => {
  ok(res, { approvals: await guardianService.listApprovalsForGuardian(req.user.id) });
}));

router.post('/approvals/:id/resolve', idempotent(), handler(async (req, res) => {
  const { status } = parse(resolveSchema, req.body);
  ok(res, { approval: await guardianService.resolveApproval(req.params.id, req.user.id, status, { requestId: req.id }) });
}));

router.get('/seniors/:seniorId/overview', handler(async (req, res) => {
  ok(res, { overview: await guardianService.seniorOverview(req.user.id, req.params.seniorId) });
}));

export default router;
