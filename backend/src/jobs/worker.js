import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { outbox } from '../notifications/outbox.js';
import { storage } from '../storage/storageProvider.js';
import { logger } from '../lib/logger.js';

// Lightweight in-process scheduler. Every job is idempotent and safe to run
// on several instances at once (claims use conditional updates), so this
// can later move to a separate `node src/worker.js` process unchanged.

const JOBS = [
  { name: 'outbox', everyMs: 5_000, run: () => outbox.processBatch() },
  {
    name: 'expire-screenshots',
    everyMs: 60_000,
    async run() {
      const expired = await prisma.screenshotAnalysis.findMany({
        where: { expiresAt: { lt: new Date() }, storageKey: { not: null } },
        select: { id: true, storageKey: true },
        take: 200,
      });
      for (const row of expired) {
        await storage.remove(row.storageKey).catch(() => {});
        await prisma.screenshotAnalysis.update({ where: { id: row.id }, data: { storageKey: null, status: 'EXPIRED' } });
      }
      return { expired: expired.length };
    },
  },
  {
    name: 'expire-actions',
    everyMs: 60_000,
    async run() {
      const open = ['DRAFT', 'REVIEW', 'USER_CONFIRMED', 'GUARDIAN_PENDING'];
      const actions = await prisma.actionProposal.updateMany({
        where: { status: { in: open }, expiresAt: { lt: new Date() } },
        data: { status: 'EXPIRED', version: { increment: 1 } },
      });
      const approvals = await prisma.guardianApproval.updateMany({
        where: { status: 'PENDING', actionProposal: { status: 'EXPIRED' } },
        data: { status: 'EXPIRED', resolvedAt: new Date(), version: { increment: 1 } },
      });
      return { actions: actions.count, approvals: approvals.count };
    },
  },
  {
    name: 'expire-tasks',
    everyMs: 5 * 60_000,
    async run() {
      const { count } = await prisma.guidedTaskSession.updateMany({
        where: { status: { in: ['ACTIVE', 'PAUSED'] }, expiresAt: { lt: new Date() } },
        data: { status: 'EXPIRED', version: { increment: 1 } },
      });
      return { expired: count };
    },
  },
  {
    name: 'cleanup',
    everyMs: 60 * 60_000,
    async run() {
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60_000);
      const [idem, resets, pairings, sessions] = await prisma.$transaction([
        prisma.idempotencyKey.deleteMany({ where: { expiresAt: { lt: now } } }),
        prisma.passwordResetToken.deleteMany({ where: { expiresAt: { lt: dayAgo } } }),
        prisma.extensionPairing.deleteMany({ where: { expiresAt: { lt: dayAgo } } }),
        prisma.session.deleteMany({ where: { expiresAt: { lt: new Date(now.getTime() - 7 * 24 * 60 * 60_000) } } }),
      ]);
      return { idempotencyKeys: idem.count, resetTokens: resets.count, pairings: pairings.count, sessions: sessions.count };
    },
  },
];

const timers = [];

export function startWorker() {
  if (!env.worker.enabled) {
    logger.info('background worker disabled');
    return;
  }
  for (const job of JOBS) {
    let running = false;
    const tick = async () => {
      if (running) return; // never overlap the same job
      running = true;
      try {
        const result = await job.run();
        logger.debug('job ran', { job: job.name, result });
      } catch (err) {
        logger.error('job failed', { job: job.name, err });
      } finally {
        running = false;
      }
    };
    timers.push(setInterval(tick, job.everyMs));
    setTimeout(tick, 1_000);
  }
  logger.info('background worker started', { jobs: JOBS.map((j) => j.name) });
}

export function stopWorker() {
  while (timers.length) clearInterval(timers.pop());
}
