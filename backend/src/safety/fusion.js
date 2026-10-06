import { maxSeverity, RULES_VERSION } from './rules.js';
import { SAFETY_POLICY_VERSION } from './riskEngine.js';

// Combines the three scam/safety signals with explicit precedence:
//   1. Deterministic rules — the floor. A rule verdict is never lowered.
//   2. HF safety classifier — may RAISE the verdict when confident.
//   3. Grok interpretation — explains; may raise, never lower.
// If the rules found nothing, the ML model was unavailable and the AI was
// unavailable or unsure, the result is UNKNOWN rather than a silent SAFE
// for content that looks like it's trying to make the user act.

const ML_TO_SEVERITY = { SAFE: 'SAFE', SUSPICIOUS: 'WARNING', HIGH_RISK: 'HIGH_RISK', CRITICAL: 'CRITICAL' };
const ML_RAISE_MIN_CONFIDENCE = 0.7;

export function fuseSafetySignals({ rule, ml = null, ai = null, looksActionable = false }) {
  let severity = rule.severity;
  const sources = ['rules'];

  if (ml && ml.confidence >= ML_RAISE_MIN_CONFIDENCE) {
    const mlSeverity = ML_TO_SEVERITY[ml.label];
    if (mlSeverity) {
      const next = maxSeverity(severity, mlSeverity);
      if (next !== severity) sources.push('ml');
      severity = next;
    }
  }

  if (ai?.severity && ai.severity !== 'UNKNOWN') {
    const next = maxSeverity(severity, ai.severity);
    if (next !== severity) sources.push('ai');
    severity = next;
  }

  const noSecondOpinion = !ml && !ai;
  if (severity === 'SAFE' && noSecondOpinion && looksActionable) {
    severity = 'UNKNOWN';
  }

  return {
    severity,
    decisionTrace: {
      policyVersion: SAFETY_POLICY_VERSION,
      rulesVersion: RULES_VERSION,
      ruleSeverity: rule.severity,
      ml: ml ? { label: ml.label, confidence: ml.confidence, modelVersion: ml.modelVersion } : null,
      ai: ai ? { severity: ai.severity, model: ai.model } : null,
      raisedBy: sources,
    },
  };
}
