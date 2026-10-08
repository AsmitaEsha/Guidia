import { prisma } from '../config/prisma.js';
import { redactObject } from '../security/sensitiveDataGuard.js';
import { logger } from '../lib/logger.js';

// Append-only audit trail for security- and safety-relevant events.
// Application code only ever inserts; there is no update/delete path.
export const AUDIT = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTERED: 'REGISTERED',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET: 'PASSWORD_RESET',
  SESSION_REUSE_DETECTED: 'SESSION_REUSE_DETECTED',
  SESSION_REVOKED: 'SESSION_REVOKED',
  PROFILE_UPDATED: 'PROFILE_UPDATED',
  GUARDIAN_INVITED: 'GUARDIAN_INVITED',
  GUARDIAN_CONNECTED: 'GUARDIAN_CONNECTED',
  GUARDIAN_REVOKED: 'GUARDIAN_REVOKED',
  PERMISSION_CHANGED: 'PERMISSION_CHANGED',
  EMERGENCY_CREATED: 'EMERGENCY_CREATED',
  EMERGENCY_UPDATED: 'EMERGENCY_UPDATED',
  ACTION_CREATED: 'ACTION_CREATED',
  ACTION_TRANSITION: 'ACTION_TRANSITION',
  GUARDIAN_APPROVED: 'GUARDIAN_APPROVED',
  GUARDIAN_REJECTED: 'GUARDIAN_REJECTED',
  SAFETY_INTERCEPTION: 'SAFETY_INTERCEPTION',
  SIMULATION_TRANSACTION_COMPLETED: 'SIMULATION_TRANSACTION_COMPLETED',
  AI_SAFETY_DECISION: 'AI_SAFETY_DECISION',
  EXTENSION_PAIRED: 'EXTENSION_PAIRED',
  EXTENSION_REVOKED: 'EXTENSION_REVOKED',
  ACCOUNT_DELETED: 'ACCOUNT_DELETED',
  DATA_EXPORTED: 'DATA_EXPORTED',
};

/**
 * @param {object} entry
 * @param {import('@prisma/client').Prisma.TransactionClient} [tx] — pass the
 *   transaction client to make the audit row part of the same commit.
 */
export async function audit(entry, tx = prisma) {
  const { actorUserId = null, actorType = 'USER', action, targetType = null, targetId = null, requestId = null, metadata = {} } = entry;
  try {
    await tx.auditLog.create({
      data: { actorUserId, actorType, action, targetType, targetId, requestId, metadata: redactObject(metadata) },
    });
  } catch (err) {
    // Inside a transaction the failure must propagate so the business
    // change rolls back with it; outside one, auditing never breaks the
    // user's request.
    if (tx !== prisma) throw err;
    logger.error('audit write failed', { action, err });
  }
}
