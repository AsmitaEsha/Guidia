import test from 'node:test';
import assert from 'node:assert/strict';
import { runRuleEngine, maxSeverity, guidanceFor } from '../rules.js';

// These scenarios mirror the ones manually verified against the live API
// during development (see GUIDIA_IMPLEMENTATION_PLAN.md Phase 10) — codified
// here so they can't silently regress.

test('maxSeverity never lowers severity', () => {
  assert.equal(maxSeverity('CRITICAL', 'SAFE'), 'CRITICAL');
  assert.equal(maxSeverity('SAFE', 'WARNING'), 'WARNING');
  assert.equal(maxSeverity('HIGH_RISK', 'HIGH_RISK'), 'HIGH_RISK');
});

test('README canonical example: urgent fake-bKash SMS with spoofed domain is CRITICAL', () => {
  const { severity, signals } = runRuleEngine(
    'URGENT: Your bKash account will be suspended TODAY unless you verify immediately. Click: http://bkash-verify-now.com/urgent'
  );
  assert.equal(severity, 'CRITICAL');
  assert.ok(signals.length >= 2, 'expected multiple contributing signals');
});

test('legitimate bkash.com link is not flagged as spoofed', () => {
  const { severity } = runRuleEngine('Your statement is ready: https://www.bkash.com/statement');
  assert.equal(severity, 'SAFE');
});

test('a phone-call-style OTP request is at least HIGH_RISK', () => {
  const { severity, signals } = runRuleEngine(
    'Hi, I am calling from your bank. Please tell me the OTP you just received to verify your identity.'
  );
  assert.equal(severity, 'HIGH_RISK');
  assert.ok(signals.some((s) => /OTP|PIN|password/i.test(s.reason)));
});

test('a prize/lottery scam is at least WARNING', () => {
  const { severity } = runRuleEngine('Congratulations! You have been selected to win 50,000 Taka! Send 500 Taka processing fee to claim.');
  assert.notEqual(severity, 'SAFE');
});

test('an ordinary message is SAFE with no signals', () => {
  const { severity, signals } = runRuleEngine('Hi Dad, are you free for lunch on Sunday?');
  assert.equal(severity, 'SAFE');
  assert.equal(signals.length, 0);
});

test('a raw-IP link is flagged even without other signals', () => {
  const { severity } = runRuleEngine('Check this out: http://192.168.1.50/promo');
  assert.notEqual(severity, 'SAFE');
});

test('a shortened link is flagged as at least a warning', () => {
  const { severity } = runRuleEngine('Here is the link: https://bit.ly/abc123');
  assert.notEqual(severity, 'SAFE');
});

test('guidanceFor always returns non-empty whatToDo and whatToAvoid for every severity', () => {
  for (const severity of ['SAFE', 'WARNING', 'HIGH_RISK', 'CRITICAL']) {
    const g = guidanceFor(severity);
    assert.ok(g.whatToDo.length > 0, `whatToDo empty for ${severity}`);
    assert.ok(g.whatToAvoid.length > 0, `whatToAvoid empty for ${severity}`);
  }
});

test('benign safety advice mentioning OTP is SAFE', () => {
  assert.equal(runRuleEngine('Never share your OTP with anyone. bKash will never ask for your PIN.').severity, 'SAFE');
  assert.equal(runRuleEngine('আপনার ওটিপি কখনো কাউকে দেবেন না।').severity, 'SAFE');
});

test('a genuine bank OTP SMS that warns not to share is SAFE', () => {
  assert.equal(runRuleEngine('Your OTP is 583921. Do not share this code with anyone.').severity, 'SAFE');
});

test('a credential request with account-closure pressure is CRITICAL', () => {
  const { severity } = runRuleEngine('Your account will be suspended today. Send your OTP now to keep it open.');
  assert.equal(severity, 'CRITICAL');
});

test('Bengali OTP request is at least HIGH_RISK', () => {
  const { severity } = runRuleEngine('আপনার ওটিপি কোডটি আমাদের পাঠান, তাহলে পুরস্কার পাবেন।');
  assert.notEqual(severity, 'SAFE');
  assert.notEqual(severity, 'WARNING');
});
