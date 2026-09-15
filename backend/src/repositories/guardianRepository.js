import { prisma } from '../config/prisma.js';

export const guardianRepository = {
  createInvite({ seniorUserId, guardianEmail, approvalThreshold }) {
    return prisma.guardianRelationship.create({
      data: { seniorUserId, guardianEmail, approvalThreshold },
    });
  },

  findById(id) {
    return prisma.guardianRelationship.findUnique({ where: { id } });
  },

  // Relationships where the current user is either the senior or the
  // already-accepted guardian, plus any still-pending invite addressed to
  // their email (so a not-yet-registered-as-guardian user still sees it
  // once they check their invites after logging in with that email).
  listForUser(userId, email) {
    return prisma.guardianRelationship.findMany({
      where: {
        OR: [
          { seniorUserId: userId },
          { guardianUserId: userId },
          { guardianEmail: email, status: 'PENDING' },
        ],
      },
      include: {
        senior: { select: { id: true, fullName: true, email: true } },
        guardian: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  accept(id, guardianUserId) {
    return prisma.guardianRelationship.update({
      where: { id },
      data: { guardianUserId, status: 'ACTIVE', respondedAt: new Date() },
      include: {
        senior: { select: { id: true, fullName: true, email: true } },
        guardian: { select: { id: true, fullName: true, email: true } },
      },
    });
  },

  revoke(id) {
    return prisma.guardianRelationship.update({
      where: { id },
      data: { status: 'REVOKED', respondedAt: new Date() },
      include: {
        senior: { select: { id: true, fullName: true, email: true } },
        guardian: { select: { id: true, fullName: true, email: true } },
      },
    });
  },

  createApproval({ relationshipId, actionType, summary }) {
    return prisma.guardianApproval.create({
      data: { relationshipId, actionType, summary: JSON.stringify(summary) },
    });
  },

  findApprovalById(id) {
    return prisma.guardianApproval.findUnique({
      where: { id },
      include: { relationship: true },
    });
  },

  resolveApproval(id, status) {
    return prisma.guardianApproval.update({
      where: { id },
      data: { status, resolvedAt: new Date() },
    });
  },

  listApprovalsForRelationship(relationshipId) {
    return prisma.guardianApproval.findMany({
      where: { relationshipId },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Every approval across every ACTIVE relationship where this user is the
  // guardian — what a guardian sees on their own dashboard.
  listApprovalsForGuardian(guardianUserId) {
    return prisma.guardianApproval.findMany({
      where: { relationship: { guardianUserId, status: 'ACTIVE' } },
      include: {
        relationship: { include: { senior: { select: { id: true, fullName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
