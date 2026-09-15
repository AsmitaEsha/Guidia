import { guardianRepository } from '../repositories/guardianRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { ApiError } from '../middleware/errorHandler.js';

function toPublicRelationship(r) {
  return {
    id: r.id,
    status: r.status,
    approvalThreshold: r.approvalThreshold,
    guardianEmail: r.guardianEmail,
    createdAt: r.createdAt,
    respondedAt: r.respondedAt,
    senior: r.senior,
    guardian: r.guardian,
  };
}

function toPublicApproval(a) {
  return {
    id: a.id,
    relationshipId: a.relationshipId,
    actionType: a.actionType,
    summary: JSON.parse(a.summary),
    status: a.status,
    createdAt: a.createdAt,
    resolvedAt: a.resolvedAt,
    ...(a.relationship?.senior ? { senior: a.relationship.senior } : {}),
  };
}

export const guardianService = {
  async invite(seniorUserId, { guardianEmail, approvalThreshold }) {
    const senior = await userRepository.findById(seniorUserId);
    if (guardianEmail.toLowerCase() === senior.email.toLowerCase()) {
      throw new ApiError(400, "You can't set yourself as your own guardian.", 'INVALID_GUARDIAN');
    }
    const relationship = await guardianRepository.createInvite({
      seniorUserId,
      guardianEmail: guardianEmail.toLowerCase(),
      approvalThreshold: approvalThreshold ?? 0,
    });
    return toPublicRelationship({ ...relationship, senior: { id: senior.id, fullName: senior.fullName, email: senior.email }, guardian: null });
  },

  async list(userId) {
    const user = await userRepository.findById(userId);
    const relationships = await guardianRepository.listForUser(userId, user.email);
    return relationships.map(toPublicRelationship);
  },

  async accept(relationshipId, guardianUserId) {
    const relationship = await guardianRepository.findById(relationshipId);
    if (!relationship) throw new ApiError(404, 'That invitation was not found.', 'NOT_FOUND');
    if (relationship.status !== 'PENDING') {
      throw new ApiError(409, 'That invitation is no longer pending.', 'INVALID_STATE');
    }
    const guardianUser = await userRepository.findById(guardianUserId);
    if (relationship.guardianEmail.toLowerCase() !== guardianUser.email.toLowerCase()) {
      throw new ApiError(403, 'This invitation was addressed to a different email address.', 'FORBIDDEN');
    }
    const updated = await guardianRepository.accept(relationshipId, guardianUser.id);
    return toPublicRelationship(updated);
  },

  async revoke(relationshipId, userId) {
    const relationship = await guardianRepository.findById(relationshipId);
    if (!relationship) throw new ApiError(404, 'That relationship was not found.', 'NOT_FOUND');
    if (relationship.seniorUserId !== userId && relationship.guardianUserId !== userId) {
      throw new ApiError(403, "You don't have access to that.", 'FORBIDDEN');
    }
    const updated = await guardianRepository.revoke(relationshipId);
    return toPublicRelationship(updated);
  },

  // Called from a Safe Practice sim's "Send for Guardian Approval" step.
  // Requires an ACTIVE relationship — a senior cannot request approval from
  // a guardian who hasn't consented yet.
  async requestApproval(seniorUserId, { relationshipId, actionType, summary }) {
    const relationship = await guardianRepository.findById(relationshipId);
    if (!relationship || relationship.seniorUserId !== seniorUserId) {
      throw new ApiError(404, 'That guardian relationship was not found.', 'NOT_FOUND');
    }
    if (relationship.status !== 'ACTIVE') {
      throw new ApiError(409, 'This guardian has not accepted your invitation yet.', 'GUARDIAN_NOT_ACTIVE');
    }
    const approval = await guardianRepository.createApproval({ relationshipId, actionType, summary });
    return toPublicApproval(approval);
  },

  async resolveApproval(approvalId, guardianUserId, status) {
    const approval = await guardianRepository.findApprovalById(approvalId);
    if (!approval) throw new ApiError(404, 'That approval request was not found.', 'NOT_FOUND');
    if (approval.relationship.guardianUserId !== guardianUserId) {
      throw new ApiError(403, "You don't have access to that.", 'FORBIDDEN');
    }
    if (approval.status !== 'PENDING') {
      throw new ApiError(409, 'That request has already been resolved.', 'INVALID_STATE');
    }
    const updated = await guardianRepository.resolveApproval(approvalId, status);
    return toPublicApproval(updated);
  },

  async listApprovals(relationshipId, userId) {
    const relationship = await guardianRepository.findById(relationshipId);
    if (!relationship || (relationship.seniorUserId !== userId && relationship.guardianUserId !== userId)) {
      throw new ApiError(404, 'That guardian relationship was not found.', 'NOT_FOUND');
    }
    const approvals = await guardianRepository.listApprovalsForRelationship(relationshipId);
    return approvals.map(toPublicApproval);
  },

  async listApprovalsForGuardian(guardianUserId) {
    const approvals = await guardianRepository.listApprovalsForGuardian(guardianUserId);
    return approvals.map(toPublicApproval);
  },
};
