import { prisma } from '../config/prisma.js';

// Notifications are synthesized from real activity tables rather than
// stored in their own table with a separate write path from every feature
// (README: "Notification counts and content should come from application
// data rather than being hardcoded"). Read/unread state is not yet
// persisted — see GUIDIA_IMPLEMENTATION_PLAN.md Phase 15 for that gap.
export const notificationService = {
  async list(userId, limit = 15) {
    const [riskAssessments, memoryEntries, guardianApprovals] = await Promise.all([
      prisma.riskAssessment.findMany({
        where: { userId, severity: { not: 'SAFE' } },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.memoryBookEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.guardianApproval.findMany({
        where: { relationship: { seniorUserId: userId }, status: { not: 'PENDING' } },
        include: { relationship: { include: { guardian: { select: { fullName: true } } } } },
        orderBy: { resolvedAt: 'desc' },
        take: limit,
      }),
    ]);

    const items = [
      ...riskAssessments.map((r) => ({
        id: `risk_${r.id}`,
        type: 'scam',
        title: 'Safety Alert',
        msg: `A message you checked was flagged as ${r.severity.replace('_', ' ').toLowerCase()}.`,
        time: r.createdAt,
      })),
      ...memoryEntries.map((m) => ({
        id: `mem_${m.id}`,
        type: 'lesson',
        title: 'Saved to Memory Book',
        msg: `"${m.title}" was added to your Memory Book.`,
        time: m.createdAt,
      })),
      ...guardianApprovals.map((a) => ({
        id: `appr_${a.id}`,
        type: 'guardian',
        title: 'Guardian Notification',
        msg: `${a.relationship.guardian?.fullName || 'Your guardian'} ${a.status === 'APPROVED' ? 'approved' : a.status === 'REJECTED' ? 'rejected' : 'flagged'} your request.`,
        time: a.resolvedAt,
      })),
    ];

    items.sort((a, b) => new Date(b.time) - new Date(a.time));
    return items.slice(0, limit);
  },
};
