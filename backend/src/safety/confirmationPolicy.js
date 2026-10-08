// How many explicit confirmations each risk level needs. Confirmation is
// always a deliberate UI control — never inferred from "the user probably
// meant yes" and never from a voice transcript alone for HIGH/CRITICAL.
const POLICY = {
  LOW: { requiresConfirmation: false, confirmationLevel: 0 },
  MEDIUM: { requiresConfirmation: true, confirmationLevel: 1 },
  HIGH: { requiresConfirmation: true, confirmationLevel: 2 },
  CRITICAL: { requiresConfirmation: true, confirmationLevel: 3 },
};

export function confirmationFor(risk) {
  return POLICY[risk] || POLICY.CRITICAL;
}

// Voice-originated confirmations are not accepted for these levels.
export function voiceConfirmationAllowed(risk) {
  return risk === 'LOW' || risk === 'MEDIUM';
}
