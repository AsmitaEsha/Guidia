import { prisma } from '../config/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import { outbox } from './outbox.js';
import { env } from '../config/env.js';

// Severity policy (guardian notification fatigue): CRITICAL and HIGH go out
// by email immediately; MEDIUM and LOW stay in-app only.
const EMAIL_SEVERITIES = new Set(['CRITICAL', 'HIGH']);

function toPublic(n) {
  return {
    id: n.id,
    type: n.type,
    severity: n.severity,
    title: n.title,
    body: n.body,
    data: n.data,
    read: Boolean(n.readAt),
    readAt: n.readAt,
    createdAt: n.createdAt,
  };
}

export const notificationService = {
  /**
   * Creates an in-app notification (deduplicated by dedupeKey) and, by
   * severity, an email outbox event — inside the caller's transaction.
   */
  async notify(tx, { userId, type, severity = 'LOW', title, body, data, dedupeKey, email }) {
    let notification;
    if (dedupeKey) {
      const existing = await tx.notification.findUnique({ where: { userId_dedupeKey: { userId, dedupeKey } } });
      if (existing) return existing;
    }
    notification = await tx.notification.create({ data: { userId, type, severity, title, body, data, dedupeKey } });

    if (email && EMAIL_SEVERITIES.has(severity)) {
      const recipient = await tx.user.findUnique({
        where: { id: userId },
        select: { email: true, preferredLanguage: true, preference: { select: { notificationsEnabled: true } } },
      });
      // Emergencies always email; other alerts respect the user's setting.
      const allowed = severity === 'CRITICAL' || recipient?.preference?.notificationsEnabled !== false;
      if (recipient && allowed) {
        await outbox.enqueueEmail({
          to: recipient.email,
          template: email.template,
          data: { ...email.data, appUrl: env.appUrl, language: recipient.preferredLanguage },
          idempotencyKey: `notification:${notification.id}`,
          notificationId: notification.id,
        }, tx);
      }
    }
    return notification;
  },

  async list(userId, { limit = 30, cursor } = {}) {
    const items = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100) + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: { outboxEvents: { select: { status: true } } },
    });
    const hasMore = items.length > limit;
    const page = items.slice(0, limit);
    const unreadCount = await prisma.notification.count({ where: { userId, readAt: null } });
    return {
      items: page.map((n) => ({ ...toPublic(n), delivery: n.outboxEvents[0]?.status ?? null })),
      unreadCount,
      nextCursor: hasMore ? page[page.length - 1].id : null,
    };
  },

  async markRead(userId, id) {
    const { count } = await prisma.notification.updateMany({ where: { id, userId, readAt: null }, data: { readAt: new Date() } });
    if (count === 0) {
      const exists = await prisma.notification.findFirst({ where: { id, userId }, select: { id: true } });
      if (!exists) throw new ApiError(404, 'That notification was not found.', 'NOT_FOUND');
    }
  },

  async markAllRead(userId) {
    const { count } = await prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
    return { updated: count };
  },

  unreadCount(userId) {
    return prisma.notification.count({ where: { userId, readAt: null } });
  },
};
