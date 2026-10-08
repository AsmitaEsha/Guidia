import { prisma } from '../config/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';

// Single place that answers "may this guardian see/do X for this senior?".
// Hiding a button in the UI is not a security boundary — every guardian
// read and write goes through these checks.

export const DEFAULT_SCOPES = ['EMERGENCY_ALERTS', 'APPROVAL_REQUESTS', 'SAFETY_ALERTS'];
export const ALL_SCOPES = ['EMERGENCY_ALERTS', 'APPROVAL_REQUESTS', 'LEARNING_PROGRESS', 'TASK_ACTIVITY', 'SAFETY_ALERTS', 'MEMORY_BOOK', 'PRIVATE_CONVERSATIONS', 'FINANCIAL_DETAILS'];

const activePermission = { revokedAt: null };

export async function guardianScopes(guardianUserId, seniorUserId, tx = prisma) {
  const rel = await tx.guardianRelationship.findFirst({
    where: { guardianUserId, seniorUserId, status: 'ACTIVE' },
    include: { permissions: { where: activePermission } },
  });
  return rel ? { relationship: rel, scopes: new Set(rel.permissions.map((p) => p.scope)) } : null;
}

export async function requireGuardianScope(guardianUserId, seniorUserId, scope, tx = prisma) {
  const access = await guardianScopes(guardianUserId, seniorUserId, tx);
  if (!access || !access.scopes.has(scope)) {
    throw new ApiError(403, "You don't have permission to see that. The person you help can change this in their Guardian settings.", 'GUARDIAN_SCOPE_REQUIRED');
  }
  return access;
}

// Active guardians of a senior holding `scope`, primary first.
export function guardiansWithScope(seniorUserId, scope, tx = prisma) {
  return tx.guardianRelationship.findMany({
    where: { seniorUserId, status: 'ACTIVE', guardianUserId: { not: null }, permissions: { some: { scope, revokedAt: null } } },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    include: { guardian: { select: { id: true, fullName: true, email: true } } },
  });
}
