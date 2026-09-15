import { prisma } from '../config/prisma.js';

// All figures here come directly from the live database — there is no
// separate "demo"/"evaluation" dataset in this deployment. If this app is
// ever run with seeded demonstration data alongside real users, that
// distinction must be added here (a `source` field or similar) so admin
// analytics never blend the two silently (README: Data Integrity).
export const adminService = {
  async listUsers() {
    return prisma.user.findMany({
      select: { id: true, fullName: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async analytics() {
    const [
      totalUsers,
      usersByRole,
      totalLessonsCompleted,
      totalRiskAssessments,
      riskBySeverity,
      totalInterceptions,
      totalGuardianRelationships,
      activeGuardianRelationships,
      totalGuardianApprovals,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ['role'], _count: true }),
      prisma.memoryBookEntry.count({ where: { category: 'LEARNING' } }),
      prisma.riskAssessment.count(),
      prisma.riskAssessment.groupBy({ by: ['severity'], _count: true }),
      prisma.safetyInterception.count(),
      prisma.guardianRelationship.count(),
      prisma.guardianRelationship.count({ where: { status: 'ACTIVE' } }),
      prisma.guardianApproval.count(),
    ]);

    return {
      totalUsers,
      usersByRole: Object.fromEntries(usersByRole.map((r) => [r.role, r._count])),
      totalLessonsCompleted,
      totalRiskAssessments,
      riskBySeverity: Object.fromEntries(riskBySeverity.map((r) => [r.severity, r._count])),
      totalInterceptions,
      totalGuardianRelationships,
      activeGuardianRelationships,
      totalGuardianApprovals,
    };
  },
};
