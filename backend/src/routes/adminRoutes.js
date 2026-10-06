import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { handler, ok } from '../lib/http.js';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));

router.get('/users', handler(async (req, res) => {
  ok(res, {
    users: await prisma.user.findMany({
      select: { id: true, fullName: true, email: true, role: true, preferredLanguage: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
  });
}));

// Aggregate counts only — no message content, no per-user detail.
router.get('/analytics', handler(async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60_000);
  const [
    totalUsers, usersByRole, lessonsCompleted, practice, riskBySeverity, interceptions,
    activeGuardians, approvalsByStatus, emergenciesByStatus, aiByStatus, outboxByStatus,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ['role'], _count: true }),
    prisma.memoryBookEntry.count({ where: { lessonId: { not: null } } }),
    prisma.practiceAttempt.groupBy({ by: ['outcome', 'independent'], _count: true }),
    prisma.riskAssessment.groupBy({ by: ['severity'], _count: true }),
    prisma.safetyInterception.count(),
    prisma.guardianRelationship.count({ where: { status: 'ACTIVE' } }),
    prisma.guardianApproval.groupBy({ by: ['status'], _count: true }),
    prisma.emergencyEvent.groupBy({ by: ['status'], _count: true }),
    prisma.aIRequestLog.groupBy({ by: ['feature', 'status'], where: { createdAt: { gte: since } }, _count: true, _avg: { latencyMs: true } }),
    prisma.outboxEvent.groupBy({ by: ['status'], _count: true }),
  ]);
  const totalAttempts = practice.reduce((n, p) => n + p._count, 0);
  const independent = practice.filter((p) => p.outcome === 'SUCCESS' && p.independent).reduce((n, p) => n + p._count, 0);
  const byKey = (rows, key) => Object.fromEntries(rows.map((r) => [r[key], r._count]));
  ok(res, {
    analytics: {
      totalUsers,
      usersByRole: byKey(usersByRole, 'role'),
      lessonsCompleted,
      practiceAttempts: totalAttempts,
      independentCompletionRate: totalAttempts ? Math.round((100 * independent) / totalAttempts) : null,
      riskBySeverity: byKey(riskBySeverity, 'severity'),
      totalInterceptions: interceptions,
      activeGuardianRelationships: activeGuardians,
      approvalsByStatus: byKey(approvalsByStatus, 'status'),
      emergenciesByStatus: byKey(emergenciesByStatus, 'status'),
      aiLast30Days: aiByStatus.map((r) => ({ feature: r.feature, status: r.status, count: r._count, avgLatencyMs: Math.round(r._avg.latencyMs ?? 0) })),
      notificationDelivery: byKey(outboxByStatus, 'status'),
    },
  });
}));

// Read-only view of operational switches (they're set via environment so
// they can be flipped without a code deploy).
router.get('/switches', (req, res) => ok(res, { features: env.features, killSwitches: env.killSwitches }));

router.get('/audit', handler(async (req, res) => {
  ok(res, {
    entries: await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { action: true, actorType: true, targetType: true, createdAt: true, requestId: true },
    }),
  });
}));

export default router;
