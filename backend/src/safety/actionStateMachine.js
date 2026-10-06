// Allowed transitions for ActionProposal.status. Anything not listed is
// rejected. Terminal states have no outgoing edges.
const TRANSITIONS = {
  DRAFT: ['REVIEW', 'CANCELLED', 'EXPIRED', 'REJECTED'],
  REVIEW: ['USER_CONFIRMED', 'CANCELLED', 'EXPIRED'],
  USER_CONFIRMED: ['GUARDIAN_PENDING', 'EXECUTING', 'CANCELLED', 'EXPIRED'],
  GUARDIAN_PENDING: ['GUARDIAN_APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'],
  GUARDIAN_APPROVED: ['EXECUTING', 'CANCELLED', 'EXPIRED'],
  EXECUTING: ['EXECUTED', 'FAILED'],
  EXECUTED: [],
  REJECTED: [],
  CANCELLED: [],
  EXPIRED: [],
  FAILED: [],
};

export const TERMINAL = new Set(['EXECUTED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'FAILED']);
export const OPEN = new Set(['DRAFT', 'REVIEW', 'USER_CONFIRMED', 'GUARDIAN_PENDING', 'GUARDIAN_APPROVED']);

export function canTransition(from, to) {
  return (TRANSITIONS[from] || []).includes(to);
}

export function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    const err = new Error(`Illegal action transition ${from} → ${to}`);
    err.code = 'ILLEGAL_TRANSITION';
    throw err;
  }
}
