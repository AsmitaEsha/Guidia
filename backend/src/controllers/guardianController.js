import { z } from 'zod';
import { guardianService } from '../services/guardianService.js';
import { ApiError } from '../middleware/errorHandler.js';

function parse(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.issues[0]?.message || 'Invalid request.', 'VALIDATION_ERROR');
  }
  return result.data;
}

const inviteSchema = z.object({
  guardianEmail: z.string().trim().email('Please enter a valid email address.'),
  approvalThreshold: z.number().int().min(0).optional(),
});

const requestApprovalSchema = z.object({
  relationshipId: z.string().min(1),
  actionType: z.string().trim().min(1).max(100),
  summary: z.object({
    what: z.string().max(500),
    who: z.string().max(500),
    amountOrData: z.string().max(500),
    consequence: z.string().max(500),
  }),
});

const resolveApprovalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'FLAGGED']),
});

export const guardianController = {
  async invite(req, res, next) {
    try {
      const data = parse(inviteSchema, req.body);
      const relationship = await guardianService.invite(req.user.id, data);
      res.status(201).json({ relationship });
    } catch (err) { next(err); }
  },

  async list(req, res, next) {
    try {
      const relationships = await guardianService.list(req.user.id);
      res.json({ relationships });
    } catch (err) { next(err); }
  },

  async accept(req, res, next) {
    try {
      const relationship = await guardianService.accept(req.params.id, req.user.id);
      res.json({ relationship });
    } catch (err) { next(err); }
  },

  async revoke(req, res, next) {
    try {
      const relationship = await guardianService.revoke(req.params.id, req.user.id);
      res.json({ relationship });
    } catch (err) { next(err); }
  },

  async requestApproval(req, res, next) {
    try {
      const data = parse(requestApprovalSchema, req.body);
      const approval = await guardianService.requestApproval(req.user.id, data);
      res.status(201).json({ approval });
    } catch (err) { next(err); }
  },

  async listApprovals(req, res, next) {
    try {
      const approvals = await guardianService.listApprovals(req.params.relationshipId, req.user.id);
      res.json({ approvals });
    } catch (err) { next(err); }
  },

  async listMyApprovals(req, res, next) {
    try {
      const approvals = await guardianService.listApprovalsForGuardian(req.user.id);
      res.json({ approvals });
    } catch (err) { next(err); }
  },

  async resolveApproval(req, res, next) {
    try {
      const { status } = parse(resolveApprovalSchema, req.body);
      const approval = await guardianService.resolveApproval(req.params.id, req.user.id, status);
      res.json({ approval });
    } catch (err) { next(err); }
  },
};
