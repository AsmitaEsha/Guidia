import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAction } from '../riskEngine.js';
import { canTransition } from '../actionStateMachine.js';
import { fuseSafetySignals } from '../fusion.js';

test('reading email is LOW and needs no confirmation', () => {
  const r = evaluateAction({ actionType: 'READ_EMAIL' });
  assert.equal(r.risk, 'LOW');
  assert.equal(r.requiresConfirmation, false);
  assert.equal(r.allowed, true);
});

test('sending money is HIGH with two confirmations', () => {
  const r = evaluateAction({ actionType: 'SEND_MONEY', amountMinor: 50_000, currency: 'BDT' });
  assert.equal(r.risk, 'HIGH');
  assert.equal(r.confirmationLevel, 2);
});

test('a large transfer is CRITICAL and involves an active guardian', () => {
  const r = evaluateAction({ actionType: 'SEND_MONEY', amountMinor: 2_500_000, currency: 'BDT', guardian: { approvalThreshold: 10_000_000 } });
  assert.equal(r.risk, 'CRITICAL');
  assert.equal(r.requiresGuardian, true);
  assert.equal(r.confirmationLevel, 3);
});

test('guardian threshold triggers approval below CRITICAL', () => {
  const r = evaluateAction({ actionType: 'SEND_MONEY', amountMinor: 100_000, currency: 'BDT', guardian: { approvalThreshold: 50_000 } });
  assert.equal(r.requiresGuardian, true);
});

test('a financial action without an amount is refused', () => {
  assert.equal(evaluateAction({ actionType: 'SEND_MONEY' }).allowed, false);
});

test('unknown and forbidden action types are refused', () => {
  assert.equal(evaluateAction({ actionType: 'TRANSFER_EVERYTHING' }).allowed, false);
  assert.equal(evaluateAction({ actionType: 'SHARE_CREDENTIALS' }).allowed, false);
});

test('context risk from a scam check can raise but never lower', () => {
  assert.equal(evaluateAction({ actionType: 'SEND_MESSAGE', contextRisk: 'HIGH' }).risk, 'HIGH');
  assert.equal(evaluateAction({ actionType: 'SEND_MONEY', amountMinor: 1000, currency: 'BDT', contextRisk: 'LOW' }).risk, 'HIGH');
});

test('the sensitive-actions kill switch blocks financial actions', () => {
  const r = evaluateAction({ actionType: 'SEND_MONEY', amountMinor: 1000, currency: 'BDT', sensitiveActionsDisabled: true });
  assert.equal(r.allowed, false);
  assert.ok(r.reasons.includes('SENSITIVE_ACTIONS_DISABLED'));
});

test('state machine forbids skipping confirmation or reopening terminal states', () => {
  assert.equal(canTransition('DRAFT', 'EXECUTING'), false);
  assert.equal(canTransition('REVIEW', 'USER_CONFIRMED'), true);
  assert.equal(canTransition('GUARDIAN_PENDING', 'EXECUTING'), false);
  assert.equal(canTransition('EXECUTED', 'EXECUTING'), false);
});

test('fusion: a CRITICAL rule verdict is never lowered by a SAFE model', () => {
  const r = fuseSafetySignals({ rule: { severity: 'CRITICAL' }, ml: { label: 'SAFE', confidence: 0.99 }, ai: { severity: 'SAFE' } });
  assert.equal(r.severity, 'CRITICAL');
});

test('fusion: a confident ML signal can raise a SAFE rule verdict', () => {
  const r = fuseSafetySignals({ rule: { severity: 'SAFE' }, ml: { label: 'HIGH_RISK', confidence: 0.9, modelVersion: 'v1' } });
  assert.equal(r.severity, 'HIGH_RISK');
  assert.deepEqual(r.decisionTrace.raisedBy, ['rules', 'ml']);
});

test('fusion: no second opinion on actionable content yields UNKNOWN, not SAFE', () => {
  assert.equal(fuseSafetySignals({ rule: { severity: 'SAFE' }, looksActionable: true }).severity, 'UNKNOWN');
  assert.equal(fuseSafetySignals({ rule: { severity: 'SAFE' }, looksActionable: false }).severity, 'SAFE');
});
