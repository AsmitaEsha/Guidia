import { prisma } from '../config/prisma.js';
import { emailProvider } from './providers/emailProvider.js';
import { renderEmail } from './templates.js';
import { logger } from '../lib/logger.js';

const MAX_ATTEMPTS = 6;
const BASE_BACKOFF_MS = 30_000;
const STALE_PROCESSING_MS = 5 * 60_000;

function backoff(attempt) {
  // 30s, 1m, 2m, 4m, 8m … capped at 1h, with ±20% jitter.
  const ms = Math.min(BASE_BACKOFF_MS * 2 ** (attempt - 1), 60 * 60_000);
  return Math.round(ms * (0.8 + Math.random() * 0.4));
}

// Transactional outbox: business code enqueues delivery work in the same DB
// transaction as the event it describes, so "emergency created" and "alert
// queued" commit or roll back together. The worker delivers afterwards.
export const outbox = {
  /**
   * @param {object} p
   * @param {import('@prisma/client').Prisma.TransactionClient} [tx]
   */
  async enqueueEmail({ to, template, data, idempotencyKey, notificationId = null }, tx = prisma) {
    try {
      return await tx.outboxEvent.create({
        data: { type: 'EMAIL', payload: { to, template, data }, idempotencyKey, notificationId },
      });
    } catch (err) {
      if (err?.code === 'P2002') return null; // already enqueued — idempotent
      throw err;
    }
  },

  // Claims and delivers a batch. Safe to run from several processes: each
  // row is claimed with a conditional update before it's sent.
  async processBatch(limit = 20) {
    const now = new Date();
    // Recover rows stuck in PROCESSING (process crashed mid-send).
    await prisma.outboxEvent.updateMany({
      where: { status: 'PROCESSING', lastAttemptAt: { lt: new Date(now.getTime() - STALE_PROCESSING_MS) } },
      data: { status: 'PENDING' },
    });

    const due = await prisma.outboxEvent.findMany({
      where: { status: 'PENDING', nextAttemptAt: { lte: now } },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    let delivered = 0;
    for (const event of due) {
      const claim = await prisma.outboxEvent.updateMany({
        where: { id: event.id, status: 'PENDING' },
        data: { status: 'PROCESSING', lastAttemptAt: new Date(), attempts: { increment: 1 } },
      });
      if (claim.count !== 1) continue;
      const attempt = event.attempts + 1;

      try {
        const result = await deliver(event);
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: result.status, processedAt: new Date(), lastError: result.reason ?? null },
        });
        if (result.status === 'SENT') delivered += 1;
      } catch (err) {
        const exhausted = attempt >= MAX_ATTEMPTS;
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: exhausted ? 'FAILED' : 'PENDING',
            nextAttemptAt: new Date(Date.now() + backoff(attempt)),
            lastError: String(err?.code || err?.message || 'DELIVERY_ERROR').slice(0, 300),
          },
        });
        logger.warn('outbox delivery failed', { outboxId: event.id, type: event.type, attempt, exhausted, err });
      }
    }
    return { claimed: due.length, delivered };
  },
};

async function deliver(event) {
  if (event.type === 'EMAIL') {
    const { to, template, data } = event.payload;
    const { subject, text } = renderEmail(template, data);
    return emailProvider.send({ to, subject, text });
  }
  return { status: 'SKIPPED', reason: `UNSUPPORTED_TYPE_${event.type}` };
}
