import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { ApiError } from '../middleware/errorHandler.js';
import { evaluateAction } from '../safety/riskEngine.js';
import { assertTransition, OPEN } from '../safety/actionStateMachine.js';
import { simulationExecutor, ensureSimulationAccount } from '../actions/simulationExecutor.js';
import { guardiansWithScope } from './guardianAccess.js';
import { notificationService } from '../notifications/notificationService.js';
import { taskService } from './taskService.js';
import { audit, AUDIT } from './auditService.js';
import { redactSensitive } from '../security/sensitiveDataGuard.js';
import { formatMoney, toMinor } from '../lib/currency.js';

const PROPOSAL_TTL_MS = 30 * 60 * 1000;

function toPublic(p) {
  return {
    id: p.id,
    status: p.status,
    applicationSlug: p.applicationSlug,
    actionType: p.actionType,
    riskLevel: p.riskLevel,
    recipientLabel: p.payload?.recipientLabel ?? null,
    amountMinor: p.amountMinor,
    currency: p.currency,
    isSimulation: p.isSimulation,
    confirmationLevel: p.confirmationLevel,
    confirmationsGiven: p.confirmationsGiven,
    requiresGuardian: p.requiresGuardian,
    reasons: p.reasons,
    version: p.version,
    expiresAt: p.expiresAt,
    executedAt: p.executedAt,
    guardianApproval: p.guardianApproval
      ? { id: p.guardianApproval.id, status: p.guardianApproval.status, resolvedAt: p.guardianApproval.resolvedAt }
      : null,
    simulationTransactionId: p.simulationTransaction?.id ?? null,
  };
}

const include = { guardianApproval: true, simulationTransaction: { select: { id: true } } };

// Moves a proposal to `to` only if it is still at `from`/`version`.
async function transition(tx, proposal, to, extra = {}, { actorUserId, actorType = 'USER', requestId } = {}) {
  assertTransition(proposal.status, to);
  const { count } = await tx.actionProposal.updateMany({
    where: { id: proposal.id, status: proposal.status, version: proposal.version },
    data: { status: to, version: { increment: 1 }, ...extra },
  });
  if (count !== 1) throw new ApiError(409, 'This action was already updated. Please refresh to see its latest state.', 'ACTION_VERSION_CONFLICT');
  await audit({ actorUserId, actorType, action: AUDIT.ACTION_TRANSITION, targetType: 'ActionProposal', targetId: proposal.id, requestId, metadata: { from: proposal.status, to } }, tx);
  return { ...proposal, ...extra, status: to, version: proposal.version + 1 };
}

async function executeInTx(tx, proposal, ctx) {
  let p = await transition(tx, proposal, 'EXECUTING', {}, ctx);
  await simulationExecutor.execute(tx, p);
  p = await transition(tx, p, 'EXECUTED', { executedAt: new Date() }, ctx);
  await audit({ actorUserId: p.userId, actorType: 'SYSTEM', action: AUDIT.SIMULATION_TRANSACTION_COMPLETED, targetType: 'ActionProposal', targetId: p.id, requestId: ctx.requestId, metadata: { amountMinor: p.amountMinor, currency: p.currency } }, tx);
  if (p.taskSessionId) await taskService.appendEvent(tx, p.taskSessionId, 'ACTION_SUCCEEDED', { actionProposalId: p.id });
  return p;
}

export const actionService = {
  async create(userId, { applicationSlug, actionType, recipientLabel, amount, amountMinor, currency, taskSessionId, newRecipient = false, contextRisk = 'LOW' }, { requestId } = {}) {
    if (taskSessionId) await taskService.getOwned(userId, taskSessionId);
    const app = await prisma.application.findUnique({ where: { slug: applicationSlug } });
    if (!app || !app.hasSimulation) throw new ApiError(404, 'That practice app was not found.', 'NOT_FOUND');
    const cur = currency || app.currency;
    const minor = amountMinor ?? (amount != null && cur ? toMinor(amount, cur) : null);

    const guardians = env.features.guardianApproval ? await guardiansWithScope(userId, 'APPROVAL_REQUESTS') : [];
    const evaluation = evaluateAction({
      actionType,
      amountMinor: minor,
      currency: cur,
      newRecipient,
      contextRisk,
      guardian: guardians[0] ? { approvalThreshold: guardians[0].approvalThreshold } : null,
      sensitiveActionsDisabled: env.killSwitches.sensitiveActions,
    });
    if (!evaluation.allowed) {
      throw new ApiError(422, evaluation.reasons.includes('SENSITIVE_ACTIONS_DISABLED')
        ? 'Practice payments are paused right now. You can still learn the steps in Lessons.'
        : "Guidia can't help with this action.", 'ACTION_NOT_ALLOWED', { reasons: evaluation.reasons });
    }

    const proposal = await prisma.$transaction(async (tx) => {
      if (minor != null && cur) {
        const account = await ensureSimulationAccount(tx, userId, app.slug, cur);
        if (account.balanceMinor < minor) throw new ApiError(409, 'There is not enough practice money in this account.', 'INSUFFICIENT_PRACTICE_BALANCE');
      }
      const created = await tx.actionProposal.create({
        data: {
          userId,
          taskSessionId: taskSessionId ?? null,
          applicationSlug: app.slug,
          actionType,
          riskLevel: evaluation.risk,
          // A human is now looking at the review screen.
          status: 'REVIEW',
          payload: { recipientLabel: redactSensitive(recipientLabel || '').text.slice(0, 120) },
          amountMinor: minor,
          currency: cur,
          isSimulation: true,
          confirmationLevel: Math.max(1, evaluation.confirmationLevel),
          requiresGuardian: evaluation.requiresGuardian,
          reasons: evaluation.reasons,
          policyVersion: evaluation.policyVersion,
          expiresAt: new Date(Date.now() + PROPOSAL_TTL_MS),
        },
        include,
      });
      await audit({ actorUserId: userId, action: AUDIT.ACTION_CREATED, targetType: 'ActionProposal', targetId: created.id, requestId, metadata: { actionType, risk: evaluation.risk, requiresGuardian: evaluation.requiresGuardian } }, tx);
      if (taskSessionId) await taskService.appendEvent(tx, taskSessionId, 'CONFIRMATION_REQUESTED', { actionProposalId: created.id, risk: evaluation.risk });
      return created;
    });
    return { proposal: toPublic(proposal), evaluation };
  },

  async get(userId, id) {
    const p = await prisma.actionProposal.findUnique({ where: { id }, include });
    if (!p || p.userId !== userId) throw new ApiError(404, 'That action was not found.', 'NOT_FOUND');
    return toPublic(p);
  },

  // One explicit confirmation per call. HIGH needs 2, CRITICAL 3 — the UI
  // shows a different check each time (amount, recipient, consequence).
  async confirm(userId, id, { version }, { requestId } = {}) {
    const ctx = { actorUserId: userId, requestId };
    return prisma.$transaction(async (tx) => {
      const p = await tx.actionProposal.findUnique({ where: { id }, include });
      if (!p || p.userId !== userId) throw new ApiError(404, 'That action was not found.', 'NOT_FOUND');
      if (version != null && p.version !== version) throw new ApiError(409, 'This action was already updated. Please refresh to see its latest state.', 'ACTION_VERSION_CONFLICT');
      if (p.status !== 'REVIEW') throw new ApiError(409, 'This action is not waiting for your confirmation.', 'ACTION_NOT_CONFIRMABLE');
      if (p.expiresAt < new Date()) throw new ApiError(409, 'This action expired. Please start again.', 'ACTION_EXPIRED');
      if (env.killSwitches.sensitiveActions) throw new ApiError(422, 'Practice payments are paused right now.', 'ACTION_NOT_ALLOWED');

      const given = p.confirmationsGiven + 1;
      if (given < p.confirmationLevel) {
        const { count } = await tx.actionProposal.updateMany({ where: { id, version: p.version, status: 'REVIEW' }, data: { confirmationsGiven: given, version: { increment: 1 } } });
        if (count !== 1) throw new ApiError(409, 'This action was already updated. Please refresh to see its latest state.', 'ACTION_VERSION_CONFLICT');
        return toPublic(await tx.actionProposal.findUnique({ where: { id }, include }));
      }

      let next = await transition(tx, p, 'USER_CONFIRMED', { confirmationsGiven: given }, ctx);

      if (p.requiresGuardian) {
        const [rel] = await guardiansWithScope(userId, 'APPROVAL_REQUESTS', tx);
        if (!rel) throw new ApiError(409, 'Your guardian is no longer connected. Please ask them to reconnect, or try a smaller practice amount.', 'GUARDIAN_UNAVAILABLE');
        next = await transition(tx, next, 'GUARDIAN_PENDING', {}, ctx);
        const senior = await tx.user.findUnique({ where: { id: userId }, select: { fullName: true } });
        const amountText = p.amountMinor != null ? formatMoney(p.amountMinor, p.currency) : null;
        await tx.guardianApproval.create({
          data: {
            relationshipId: rel.id,
            actionProposalId: p.id,
            actionType: p.actionType,
            summary: { what: p.actionType, who: p.payload?.recipientLabel ?? '', amountOrData: amountText ?? '', application: p.applicationSlug, isSimulation: true },
          },
        });
        await notificationService.notify(tx, {
          userId: rel.guardianUserId,
          type: 'APPROVAL_REQUEST',
          severity: 'HIGH',
          title: `${senior.fullName} is asking for your approval`,
          body: `Practice ${p.actionType.replace(/_/g, ' ').toLowerCase()}${amountText ? ` of ${amountText}` : ''} in ${p.applicationSlug}. No real money moves.`,
          data: { actionProposalId: p.id, seniorId: userId },
          dedupeKey: `approval:${p.id}`,
          email: { template: 'approval_request', data: { seniorName: senior.fullName, what: p.actionType.replace(/_/g, ' ').toLowerCase(), application: p.applicationSlug, amount: amountText } },
        });
        if (p.taskSessionId) await taskService.appendEvent(tx, p.taskSessionId, 'GUARDIAN_REQUESTED', { actionProposalId: p.id });
      } else {
        await executeInTx(tx, next, ctx);
      }
      return toPublic(await tx.actionProposal.findUnique({ where: { id }, include }));
    });
  },

  async cancel(userId, id, { requestId } = {}) {
    return prisma.$transaction(async (tx) => {
      const p = await tx.actionProposal.findUnique({ where: { id }, include });
      if (!p || p.userId !== userId) throw new ApiError(404, 'That action was not found.', 'NOT_FOUND');
      if (!OPEN.has(p.status)) throw new ApiError(409, 'This action has already finished.', 'ACTION_CLOSED');
      await transition(tx, p, 'CANCELLED', {}, { actorUserId: userId, requestId });
      if (p.guardianApproval?.status === 'PENDING') {
        await tx.guardianApproval.update({ where: { id: p.guardianApproval.id }, data: { status: 'EXPIRED', resolvedAt: new Date(), version: { increment: 1 } } });
      }
      return toPublic(await tx.actionProposal.findUnique({ where: { id }, include }));
    });
  },

  // Called from guardianService after permission checks.
  async resolveGuardianApproval(tx, approval, decision, { guardianUserId, requestId }) {
    const ctx = { actorUserId: guardianUserId, actorType: 'GUARDIAN', requestId };
    const { count } = await tx.guardianApproval.updateMany({
      where: { id: approval.id, status: 'PENDING', version: approval.version },
      data: { status: decision, resolvedAt: new Date(), version: { increment: 1 } },
    });
    // Second click on Approve / two guardians at once → exactly one wins.
    if (count !== 1) throw new ApiError(409, 'This request was already answered.', 'APPROVAL_ALREADY_RESOLVED');

    await audit({ actorUserId: guardianUserId, actorType: 'GUARDIAN', action: decision === 'APPROVED' ? AUDIT.GUARDIAN_APPROVED : AUDIT.GUARDIAN_REJECTED, targetType: 'GuardianApproval', targetId: approval.id, requestId }, tx);

    if (!approval.actionProposalId) return;
    const p = await tx.actionProposal.findUnique({ where: { id: approval.actionProposalId } });
    if (!p || p.status !== 'GUARDIAN_PENDING') return;

    let outcome;
    if (decision === 'APPROVED') {
      const approved = await transition(tx, p, 'GUARDIAN_APPROVED', {}, ctx);
      if (p.taskSessionId) await taskService.appendEvent(tx, p.taskSessionId, 'GUARDIAN_APPROVED', { actionProposalId: p.id });
      await executeInTx(tx, approved, ctx);
      outcome = 'approved and completed';
    } else {
      await transition(tx, p, 'REJECTED', {}, ctx);
      if (p.taskSessionId) await taskService.appendEvent(tx, p.taskSessionId, 'GUARDIAN_REJECTED', { actionProposalId: p.id });
      outcome = decision === 'FLAGGED' ? 'paused for a conversation' : 'declined';
    }
    const guardian = await tx.user.findUnique({ where: { id: guardianUserId }, select: { fullName: true } });
    await notificationService.notify(tx, {
      userId: p.userId,
      type: 'APPROVAL_RESULT',
      severity: 'MEDIUM',
      title: decision === 'APPROVED' ? 'Your guardian approved' : 'Your guardian would like to talk first',
      body: `${guardian?.fullName || 'Your guardian'} ${outcome} your practice ${p.actionType.replace(/_/g, ' ').toLowerCase()}.`,
      data: { actionProposalId: p.id, decision },
      dedupeKey: `approval_result:${p.id}`,
    });
  },

  async simulationAccounts(userId) {
    return prisma.simulationAccount.findMany({
      where: { userId },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
  },
};
