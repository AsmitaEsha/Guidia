import { prisma } from '../config/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import { notificationService } from '../notifications/notificationService.js';
import { guardiansWithScope, requireGuardianScope } from './guardianAccess.js';
import { audit, AUDIT } from './auditService.js';
import { redactSensitive } from '../security/sensitiveDataGuard.js';

const OPEN = ['TRIGGERED', 'SENT', 'ACKNOWLEDGED', 'CONTACTED'];
const DEDUPE_WINDOW_MS = 10 * 60_000;

const REASON_LABEL = {
  I_AM_CONFUSED: 'They feel confused and would like help',
  I_THINK_THIS_IS_UNSAFE: 'They think something may be unsafe',
  I_MAY_HAVE_MADE_A_MISTAKE: 'They think they may have made a mistake',
  PAYMENT_HELP: 'They need help with a payment',
  APPOINTMENT_HELP: 'They need help with an appointment',
  OTHER: 'They asked for help',
};

// Guardian-side transitions and who may perform them.
const TRANSITIONS = {
  acknowledge: { from: ['TRIGGERED', 'SENT'], to: 'ACKNOWLEDGED', stamp: 'acknowledgedAt', actor: 'guardian' },
  contacted: { from: ['TRIGGERED', 'SENT', 'ACKNOWLEDGED'], to: 'CONTACTED', stamp: 'contactedAt', actor: 'guardian' },
  resolve: { from: OPEN, to: 'RESOLVED', stamp: 'resolvedAt', actor: 'either' },
  cancel: { from: OPEN, to: 'CANCELLED', stamp: 'cancelledAt', actor: 'senior' },
};

function toPublic(e) {
  return {
    id: e.id,
    reason: e.reason,
    severity: e.severity,
    message: e.message,
    status: e.status,
    createdAt: e.createdAt,
    sentAt: e.sentAt,
    acknowledgedAt: e.acknowledgedAt,
    contactedAt: e.contactedAt,
    resolvedAt: e.resolvedAt,
    cancelledAt: e.cancelledAt,
    acknowledgedBy: e.acknowledgedBy?.fullName ?? null,
    senior: e.senior ? { id: e.senior.id, fullName: e.senior.fullName } : undefined,
    guardiansNotified: e.guardiansNotified,
    version: e.version,
  };
}

export const emergencyService = {
  async create(seniorId, { reason, message, taskSessionId }, { requestId } = {}) {
    // A second press while help is already on its way returns the same
    // event — guardians get one alert, not five.
    const recent = await prisma.emergencyEvent.findFirst({
      where: { seniorId, status: { in: OPEN }, createdAt: { gt: new Date(Date.now() - DEDUPE_WINDOW_MS) } },
      orderBy: { createdAt: 'desc' },
    });
    if (recent) return { ...toPublic(recent), deduplicated: true };

    return prisma.$transaction(async (tx) => {
      const senior = await tx.user.findUnique({ where: { id: seniorId }, select: { fullName: true } });
      const cleanMessage = message ? redactSensitive(message).text.slice(0, 500) : null;
      if (taskSessionId) {
        const task = await tx.guidedTaskSession.findUnique({ where: { id: taskSessionId }, select: { userId: true } });
        if (!task || task.userId !== seniorId) taskSessionId = undefined;
      }
      let event = await tx.emergencyEvent.create({
        data: { seniorId, reason, message: cleanMessage, taskSessionId: taskSessionId ?? null, severity: reason === 'I_MAY_HAVE_MADE_A_MISTAKE' || reason === 'PAYMENT_HELP' ? 'CRITICAL' : 'HIGH' },
      });
      const guardians = await guardiansWithScope(seniorId, 'EMERGENCY_ALERTS', tx);
      for (const rel of guardians) {
        await notificationService.notify(tx, {
          userId: rel.guardianUserId,
          type: 'EMERGENCY',
          severity: 'CRITICAL',
          title: `${senior.fullName} asked for help`,
          body: REASON_LABEL[reason],
          data: { emergencyId: event.id, seniorId },
          dedupeKey: `emergency:${event.id}`,
          email: { template: 'emergency_alert', data: { seniorName: senior.fullName, reasonLabel: REASON_LABEL[reason], message: cleanMessage } },
        });
      }
      if (guardians.length) {
        event = await tx.emergencyEvent.update({ where: { id: event.id }, data: { status: 'SENT', sentAt: new Date(), version: { increment: 1 } } });
      }
      await audit({ actorUserId: seniorId, action: AUDIT.EMERGENCY_CREATED, targetType: 'EmergencyEvent', targetId: event.id, requestId, metadata: { reason, guardiansNotified: guardians.length } }, tx);
      return { ...toPublic({ ...event, guardiansNotified: guardians.length }), deduplicated: false };
    });
  },

  async listMine(seniorId) {
    const rows = await prisma.emergencyEvent.findMany({
      where: { seniorId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { acknowledgedBy: { select: { fullName: true } } },
    });
    return rows.map(toPublic);
  },

  async listIncoming(guardianUserId) {
    const rows = await prisma.emergencyEvent.findMany({
      where: { senior: { guardianRelationshipsAsSenior: { some: { guardianUserId, status: 'ACTIVE', permissions: { some: { scope: 'EMERGENCY_ALERTS', revokedAt: null } } } } } },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { senior: { select: { id: true, fullName: true } }, acknowledgedBy: { select: { fullName: true } } },
    });
    return rows.map(toPublic);
  },

  async transition(userId, id, action, { requestId } = {}) {
    const rule = TRANSITIONS[action];
    if (!rule) throw new ApiError(400, 'Unknown action.', 'VALIDATION_ERROR');

    return prisma.$transaction(async (tx) => {
      const event = await tx.emergencyEvent.findUnique({ where: { id } });
      if (!event) throw new ApiError(404, 'That help request was not found.', 'NOT_FOUND');
      const isSenior = event.seniorId === userId;
      if (!isSenior) {
        if (rule.actor === 'senior') throw new ApiError(403, "You don't have access to that.", 'FORBIDDEN');
        await requireGuardianScope(userId, event.seniorId, 'EMERGENCY_ALERTS', tx);
      } else if (rule.actor === 'guardian') {
        throw new ApiError(403, "You don't have access to that.", 'FORBIDDEN');
      }
      if (!rule.from.includes(event.status)) throw new ApiError(409, 'This help request has already moved on.', 'INVALID_STATE');

      const { count } = await tx.emergencyEvent.updateMany({
        where: { id, version: event.version, status: event.status },
        data: { status: rule.to, [rule.stamp]: new Date(), version: { increment: 1 }, ...(action === 'acknowledge' ? { acknowledgedById: userId } : {}) },
      });
      if (count !== 1) throw new ApiError(409, 'This help request was just updated. Please refresh.', 'EMERGENCY_VERSION_CONFLICT');

      if (!isSenior) {
        const guardian = await tx.user.findUnique({ where: { id: userId }, select: { fullName: true } });
        const words = { acknowledge: 'has seen your request for help', contacted: 'says they have contacted you', resolve: 'marked your request as resolved' };
        await notificationService.notify(tx, {
          userId: event.seniorId,
          type: 'EMERGENCY_UPDATE',
          severity: 'HIGH',
          title: `${guardian.fullName} ${words[action]}`,
          body: action === 'acknowledge' ? 'Help is on the way. Stay where you are and take a slow breath.' : '',
          dedupeKey: `emergency:${id}:${action}`,
        });
      }
      await audit({ actorUserId: userId, actorType: isSenior ? 'USER' : 'GUARDIAN', action: AUDIT.EMERGENCY_UPDATED, targetType: 'EmergencyEvent', targetId: id, requestId, metadata: { from: event.status, to: rule.to } }, tx);
      const fresh = await tx.emergencyEvent.findUnique({ where: { id }, include: { acknowledgedBy: { select: { fullName: true } } } });
      return toPublic(fresh);
    });
  },
};
