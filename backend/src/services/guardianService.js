import { prisma } from '../config/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import { notificationService } from '../notifications/notificationService.js';
import { outbox } from '../notifications/outbox.js';
import { audit, AUDIT } from './auditService.js';
import { actionService } from './actionService.js';
import { progressService } from './progressService.js';
import { ALL_SCOPES, DEFAULT_SCOPES, guardianScopes, requireGuardianScope } from './guardianAccess.js';
import { stableHash } from '../security/tokens.js';
import { env } from '../config/env.js';

const person = { select: { id: true, fullName: true, email: true } };

function toPublicRelationship(r) {
  return {
    id: r.id,
    status: r.status,
    role: r.role,
    approvalThreshold: r.approvalThreshold,
    guardianEmail: r.guardianEmail,
    createdAt: r.createdAt,
    respondedAt: r.respondedAt,
    senior: r.senior ?? null,
    guardian: r.guardian ?? null,
    permissions: (r.permissions ?? []).filter((p) => !p.revokedAt).map((p) => p.scope),
  };
}

function toPublicApproval(a) {
  return {
    id: a.id,
    relationshipId: a.relationshipId,
    actionProposalId: a.actionProposalId,
    actionType: a.actionType,
    summary: a.summary,
    status: a.status,
    version: a.version,
    createdAt: a.createdAt,
    resolvedAt: a.resolvedAt,
    senior: a.relationship?.senior ?? null,
  };
}

async function loadRelationship(id) {
  return prisma.guardianRelationship.findUnique({ where: { id }, include: { senior: person, guardian: person, permissions: true } });
}

export const guardianService = {
  async invite(seniorUserId, { guardianEmail, approvalThreshold = 0, role = 'PRIMARY', permissions = DEFAULT_SCOPES }, { requestId } = {}) {
    const senior = await prisma.user.findUnique({ where: { id: seniorUserId } });
    const email = guardianEmail.toLowerCase();
    if (email === senior.email.toLowerCase()) throw new ApiError(400, "You can't add yourself as your own trusted person.", 'INVALID_GUARDIAN');

    const open = await prisma.guardianRelationship.findFirst({ where: { seniorUserId, guardianEmail: email, status: { in: ['PENDING', 'ACTIVE'] } } });
    if (open) throw new ApiError(409, 'This person is already invited or connected.', 'ALREADY_INVITED');

    const scopes = [...new Set(permissions)].filter((s) => ALL_SCOPES.includes(s));
    const relationship = await prisma.$transaction(async (tx) => {
      const rel = await tx.guardianRelationship.create({
        data: { seniorUserId, guardianEmail: email, approvalThreshold, role, permissions: { create: scopes.map((scope) => ({ scope })) } },
      });
      const existingUser = await tx.user.findUnique({ where: { email }, select: { id: true } });
      if (existingUser) {
        await notificationService.notify(tx, {
          userId: existingUser.id,
          type: 'GUARDIAN_INVITE',
          severity: 'HIGH',
          title: `${senior.fullName} invited you to be a trusted person`,
          body: 'Open Guardian to accept or decline.',
          data: { relationshipId: rel.id },
          dedupeKey: `guardian_invite:${rel.id}`,
          email: { template: 'guardian_invite', data: { seniorName: senior.fullName } },
        });
      } else {
        await outbox.enqueueEmail({ to: email, template: 'guardian_invite', data: { seniorName: senior.fullName, appUrl: env.appUrl }, idempotencyKey: `guardian_invite:${rel.id}` }, tx);
      }
      await audit({ actorUserId: seniorUserId, action: AUDIT.GUARDIAN_INVITED, targetType: 'GuardianRelationship', targetId: rel.id, requestId, metadata: { scopes } }, tx);
      return rel;
    });
    return toPublicRelationship(await loadRelationship(relationship.id));
  },

  async list(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    const rels = await prisma.guardianRelationship.findMany({
      where: { OR: [{ seniorUserId: userId }, { guardianUserId: userId }, { guardianEmail: user.email.toLowerCase(), status: 'PENDING' }] },
      include: { senior: person, guardian: person, permissions: true },
      orderBy: { createdAt: 'desc' },
    });
    return {
      myTrustedPeople: rels.filter((r) => r.seniorUserId === userId).map(toPublicRelationship),
      peopleIHelp: rels.filter((r) => r.guardianUserId === userId && r.status === 'ACTIVE').map(toPublicRelationship),
      invitationsForMe: rels.filter((r) => r.status === 'PENDING' && r.seniorUserId !== userId && r.guardianEmail === user.email.toLowerCase()).map(toPublicRelationship),
    };
  },

  async accept(relationshipId, guardianUserId, { requestId } = {}) {
    const guardianUser = await prisma.user.findUnique({ where: { id: guardianUserId } });
    const rel = await prisma.guardianRelationship.findUnique({ where: { id: relationshipId } });
    if (!rel) throw new ApiError(404, 'That invitation was not found.', 'NOT_FOUND');
    if (rel.guardianEmail.toLowerCase() !== guardianUser.email.toLowerCase()) throw new ApiError(403, 'This invitation was sent to a different email address.', 'FORBIDDEN');

    await prisma.$transaction(async (tx) => {
      const { count } = await tx.guardianRelationship.updateMany({
        where: { id: relationshipId, status: 'PENDING' },
        data: { guardianUserId, status: 'ACTIVE', respondedAt: new Date() },
      });
      if (count !== 1) throw new ApiError(409, 'That invitation is no longer pending.', 'INVALID_STATE');
      await notificationService.notify(tx, {
        userId: rel.seniorUserId,
        type: 'GUARDIAN_CONNECTED',
        severity: 'MEDIUM',
        title: `${guardianUser.fullName} is now one of your trusted people`,
        body: 'You can change what they can see at any time in Guardian.',
        dedupeKey: `guardian_connected:${relationshipId}`,
      });
      await audit({ actorUserId: guardianUserId, actorType: 'GUARDIAN', action: AUDIT.GUARDIAN_CONNECTED, targetType: 'GuardianRelationship', targetId: relationshipId, requestId }, tx);
    });
    return toPublicRelationship(await loadRelationship(relationshipId));
  },

  // Either side may end the relationship; the invited person may decline.
  async revoke(relationshipId, userId, { requestId } = {}) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, fullName: true } });
    const rel = await prisma.guardianRelationship.findUnique({ where: { id: relationshipId } });
    const isParty = rel && (rel.seniorUserId === userId || rel.guardianUserId === userId || (rel.status === 'PENDING' && rel.guardianEmail === user.email.toLowerCase()));
    if (!isParty) throw new ApiError(404, 'That relationship was not found.', 'NOT_FOUND');
    if (rel.status === 'REVOKED') return toPublicRelationship(await loadRelationship(relationshipId));

    await prisma.$transaction(async (tx) => {
      await tx.guardianRelationship.update({ where: { id: relationshipId }, data: { status: 'REVOKED', respondedAt: new Date() } });
      await tx.guardianApproval.updateMany({ where: { relationshipId, status: 'PENDING' }, data: { status: 'EXPIRED', resolvedAt: new Date(), version: { increment: 1 } } });
      const otherId = rel.seniorUserId === userId ? rel.guardianUserId : rel.seniorUserId;
      if (otherId) {
        await notificationService.notify(tx, {
          userId: otherId,
          type: 'GUARDIAN_REVOKED',
          severity: 'MEDIUM',
          title: 'A trusted-person connection ended',
          body: `${user.fullName} ended the connection on Guidia.`,
          dedupeKey: `guardian_revoked:${relationshipId}`,
        });
      }
      await audit({ actorUserId: userId, action: AUDIT.GUARDIAN_REVOKED, targetType: 'GuardianRelationship', targetId: relationshipId, requestId }, tx);
    });
    return toPublicRelationship(await loadRelationship(relationshipId));
  },

  // Only the senior sets what a guardian can see; every change is visible
  // to the senior and the guardian is told.
  async setPermissions(relationshipId, seniorUserId, scopes, { approvalThreshold, requestId } = {}) {
    const rel = await prisma.guardianRelationship.findUnique({ where: { id: relationshipId }, include: { permissions: true, guardian: person } });
    if (!rel || rel.seniorUserId !== seniorUserId) throw new ApiError(404, 'That relationship was not found.', 'NOT_FOUND');
    if (rel.status === 'REVOKED') throw new ApiError(409, 'This connection has ended.', 'INVALID_STATE');

    const wanted = new Set(scopes.filter((s) => ALL_SCOPES.includes(s)));
    const current = new Set(rel.permissions.filter((p) => !p.revokedAt).map((p) => p.scope));
    const added = [...wanted].filter((s) => !current.has(s));
    const removed = [...current].filter((s) => !wanted.has(s));

    await prisma.$transaction(async (tx) => {
      for (const scope of added) {
        await tx.guardianPermission.upsert({
          where: { relationshipId_scope: { relationshipId, scope } },
          create: { relationshipId, scope },
          update: { revokedAt: null, grantedAt: new Date() },
        });
      }
      if (removed.length) {
        await tx.guardianPermission.updateMany({ where: { relationshipId, scope: { in: removed } }, data: { revokedAt: new Date() } });
      }
      if (approvalThreshold != null) {
        await tx.guardianRelationship.update({ where: { id: relationshipId }, data: { approvalThreshold } });
      }
      if (added.length || removed.length) {
        const changeKey = stableHash({ added, removed, at: Date.now() }).slice(0, 16);
        await notificationService.notify(tx, {
          userId: seniorUserId,
          type: 'PERMISSION_CHANGED',
          severity: 'MEDIUM',
          title: 'Your sharing settings changed',
          body: `What ${rel.guardian?.fullName || rel.guardianEmail} can see was updated.`,
          data: { added, removed },
          dedupeKey: `perm:${relationshipId}:${changeKey}`,
        });
        if (rel.guardianUserId) {
          await notificationService.notify(tx, {
            userId: rel.guardianUserId,
            type: 'PERMISSION_CHANGED',
            severity: 'LOW',
            title: 'Sharing settings changed',
            body: 'The person you help updated what you can see.',
            dedupeKey: `perm_g:${relationshipId}:${changeKey}`,
          });
        }
        await audit({ actorUserId: seniorUserId, action: AUDIT.PERMISSION_CHANGED, targetType: 'GuardianRelationship', targetId: relationshipId, requestId, metadata: { added, removed } }, tx);
      }
    });
    return toPublicRelationship(await loadRelationship(relationshipId));
  },

  async listApprovalsForGuardian(guardianUserId) {
    const approvals = await prisma.guardianApproval.findMany({
      where: { relationship: { guardianUserId, status: 'ACTIVE', permissions: { some: { scope: 'APPROVAL_REQUESTS', revokedAt: null } } } },
      include: { relationship: { include: { senior: { select: { id: true, fullName: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return approvals.map(toPublicApproval);
  },

  async resolveApproval(approvalId, guardianUserId, decision, { requestId } = {}) {
    await prisma.$transaction(async (tx) => {
      const approval = await tx.guardianApproval.findUnique({ where: { id: approvalId }, include: { relationship: true } });
      if (!approval || approval.relationship.guardianUserId !== guardianUserId) throw new ApiError(404, 'That request was not found.', 'NOT_FOUND');
      await requireGuardianScope(guardianUserId, approval.relationship.seniorUserId, 'APPROVAL_REQUESTS', tx);
      if (approval.status !== 'PENDING') throw new ApiError(409, 'This request was already answered.', 'APPROVAL_ALREADY_RESOLVED');
      await actionService.resolveGuardianApproval(tx, approval, decision, { guardianUserId, requestId });
    });
    const fresh = await prisma.guardianApproval.findUnique({ where: { id: approvalId }, include: { relationship: { include: { senior: { select: { id: true, fullName: true } } } } } });
    return toPublicApproval(fresh);
  },

  // What a guardian may see about one senior — strictly by permission.
  async seniorOverview(guardianUserId, seniorUserId) {
    const access = await guardianScopes(guardianUserId, seniorUserId);
    if (!access) throw new ApiError(404, 'That person was not found.', 'NOT_FOUND');
    const { scopes, relationship } = access;
    const senior = await prisma.user.findUnique({ where: { id: seniorUserId }, select: { id: true, fullName: true } });
    const overview = { senior, permissions: [...scopes], connectedSince: relationship.respondedAt };

    if (scopes.has('LEARNING_PROGRESS')) overview.progress = await progressService.summary(seniorUserId);
    if (scopes.has('SAFETY_ALERTS')) {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60_000);
      const rows = await prisma.riskAssessment.groupBy({ by: ['severity'], where: { userId: seniorUserId, createdAt: { gte: since } }, _count: true });
      // Counts only — never the message content.
      overview.safety = { last30Days: Object.fromEntries(rows.map((r) => [r.severity, r._count])) };
    }
    if (scopes.has('TASK_ACTIVITY')) {
      const task = await prisma.guidedTaskSession.findFirst({
        where: { userId: seniorUserId, status: { in: ['ACTIVE', 'PAUSED', 'WAITING_FOR_CONFIRMATION', 'WAITING_FOR_GUARDIAN'] } },
        orderBy: { updatedAt: 'desc' },
        select: { goal: true, status: true, currentStepOrder: true, updatedAt: true, scenario: { select: { title: true } }, lesson: { select: { title: true } } },
      });
      overview.currentTask = task;
    }
    if (scopes.has('EMERGENCY_ALERTS')) {
      overview.openEmergencies = await prisma.emergencyEvent.findMany({
        where: { seniorId: seniorUserId, status: { in: ['TRIGGERED', 'SENT', 'ACKNOWLEDGED', 'CONTACTED'] } },
        select: { id: true, reason: true, status: true, createdAt: true },
      });
    }
    if (scopes.has('MEMORY_BOOK')) {
      overview.recentMemories = await prisma.memoryBookEntry.findMany({ where: { userId: seniorUserId }, orderBy: { createdAt: 'desc' }, take: 5, select: { title: true, category: true, createdAt: true } });
    }
    return overview;
  },
};
