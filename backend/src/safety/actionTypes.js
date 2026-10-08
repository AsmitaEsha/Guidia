// Every action Guidia can be asked to carry out, with its baseline risk.
// Anything not listed here is rejected — new action types are added
// deliberately, never inferred from model output.
export const ACTION_TYPES = {
  READ_EMAIL: { baseRisk: 'LOW', financial: false },
  READ_MESSAGE: { baseRisk: 'LOW', financial: false },
  SEND_MESSAGE: { baseRisk: 'LOW', financial: false },
  SEND_EMAIL: { baseRisk: 'LOW', financial: false },
  SHARE_PHOTO: { baseRisk: 'MEDIUM', financial: false },
  BOOK_APPOINTMENT: { baseRisk: 'MEDIUM', financial: false },
  PAID_BOOKING: { baseRisk: 'HIGH', financial: true },
  PURCHASE: { baseRisk: 'HIGH', financial: true },
  SEND_MONEY: { baseRisk: 'HIGH', financial: true },
  PAY_BILL: { baseRisk: 'HIGH', financial: true },
  CHANGE_SECURITY_SETTINGS: { baseRisk: 'CRITICAL', financial: false },
  SHARE_CREDENTIALS: { baseRisk: 'CRITICAL', financial: false, forbidden: true },
};

export const RISK_ORDER = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export function maxRisk(a, b) {
  return RISK_ORDER.indexOf(a) >= RISK_ORDER.indexOf(b) ? a : b;
}

export function isKnownActionType(type) {
  return Object.hasOwn(ACTION_TYPES, type);
}
