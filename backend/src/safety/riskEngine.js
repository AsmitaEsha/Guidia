import { ACTION_TYPES, maxRisk, isKnownActionType } from './actionTypes.js';
import { confirmationFor } from './confirmationPolicy.js';

export const SAFETY_POLICY_VERSION = 'policy-2026.10.1';

// Per-currency thresholds in minor units (see currency.js: BDT/INR/USD have
// 2 decimal places, VND has none). At or above `large` is CRITICAL
// regardless of other signals.
const LARGE_AMOUNT = {
  BDT: { elevated: 500_000, large: 2_000_000 }, // ৳5,000 / ৳20,000
  INR: { elevated: 500_000, large: 2_500_000 }, // ₹5,000 / ₹25,000
  VND: { elevated: 2_000_000, large: 10_000_000 }, // 2M / 10M đồng
  USD: { elevated: 10_000, large: 50_000 }, // $100 / $500
};

/**
 * Deterministic evaluation of a proposed action. This is the final
 * authority for sensitive actions — AI output can only feed in as a
 * `contextRisk` signal that may raise, never lower, the result.
 *
 * @param {object} p
 * @param {string} p.actionType
 * @param {number} [p.amountMinor]
 * @param {string} [p.currency]
 * @param {boolean} [p.newRecipient]
 * @param {'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'} [p.contextRisk] e.g. from a scam check on the message that prompted this
 * @param {{ approvalThreshold: number } | null} [p.guardian] active guardian with approval scope
 * @param {boolean} [p.sensitiveActionsDisabled] kill switch
 */
export function evaluateAction({ actionType, amountMinor = null, currency = null, newRecipient = false, contextRisk = 'LOW', guardian = null, sensitiveActionsDisabled = false }) {
  const reasons = [];

  if (!isKnownActionType(actionType)) {
    return { allowed: false, risk: 'CRITICAL', requiresConfirmation: true, confirmationLevel: 3, requiresGuardian: false, reasons: ['UNKNOWN_ACTION_TYPE'], policyVersion: SAFETY_POLICY_VERSION };
  }
  const def = ACTION_TYPES[actionType];
  if (def.forbidden) {
    return { allowed: false, risk: 'CRITICAL', requiresConfirmation: true, confirmationLevel: 3, requiresGuardian: false, reasons: ['FORBIDDEN_ACTION'], policyVersion: SAFETY_POLICY_VERSION };
  }

  let risk = def.baseRisk;
  reasons.push(`BASE_${def.baseRisk}`);

  if (def.financial) {
    if (amountMinor == null || !currency) {
      return { allowed: false, risk: 'HIGH', requiresConfirmation: true, confirmationLevel: 2, requiresGuardian: false, reasons: ['MISSING_AMOUNT'], policyVersion: SAFETY_POLICY_VERSION };
    }
    const t = LARGE_AMOUNT[currency] || LARGE_AMOUNT.USD;
    if (amountMinor >= t.large) {
      risk = maxRisk(risk, 'CRITICAL');
      reasons.push('LARGE_AMOUNT');
    } else if (amountMinor >= t.elevated) {
      reasons.push('ELEVATED_AMOUNT');
    }
    if (newRecipient) {
      risk = maxRisk(risk, 'HIGH');
      reasons.push('NEW_RECIPIENT');
    }
  }

  if (contextRisk && contextRisk !== 'LOW') {
    risk = maxRisk(risk, contextRisk);
    reasons.push(`CONTEXT_${contextRisk}`);
  }

  if (sensitiveActionsDisabled && (def.financial || risk === 'CRITICAL')) {
    return { allowed: false, risk, requiresConfirmation: true, confirmationLevel: 3, requiresGuardian: false, reasons: [...reasons, 'SENSITIVE_ACTIONS_DISABLED'], policyVersion: SAFETY_POLICY_VERSION };
  }

  // Guardian approval: the senior chose a threshold when inviting; CRITICAL
  // financial actions always involve the guardian when one is active.
  let requiresGuardian = false;
  if (guardian && def.financial) {
    if (risk === 'CRITICAL' || (amountMinor != null && amountMinor >= guardian.approvalThreshold)) {
      requiresGuardian = true;
      reasons.push('GUARDIAN_POLICY');
    }
  }

  const { requiresConfirmation, confirmationLevel } = confirmationFor(risk);
  return { allowed: true, risk, requiresConfirmation, confirmationLevel, requiresGuardian, reasons, policyVersion: SAFETY_POLICY_VERSION };
}
