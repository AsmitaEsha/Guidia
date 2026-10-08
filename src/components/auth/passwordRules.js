// Labels are [en, bn, hi, vi] for t().
export const PASSWORD_RULES = [
  { test: (p) => p.length >= 8, label: ['At least 8 characters', 'কমপক্ষে ৮টি অক্ষর', 'कम से कम 8 अक्षर', 'Ít nhất 8 ký tự'] },
  { test: (p) => /[0-9]/.test(p), label: ['A number', 'একটি সংখ্যা', 'एक अंक', 'Một chữ số'] },
  { test: (p) => /[A-Z]/.test(p) && /[a-z]/.test(p), label: ['An uppercase and a lowercase letter', 'একটি বড় ও একটি ছোট হাতের অক্ষর', 'एक बड़ा और एक छोटा अक्षर', 'Một chữ hoa và một chữ thường'] },
];

export function isPasswordStrong(password) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

/** 0–4: rules met, plus a bonus for length ≥ 12 or a symbol. */
export function passwordStrength(password) {
  if (!password) return 0;
  const met = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const bonus = password.length >= 12 || /[^A-Za-z0-9]/.test(password) ? 1 : 0;
  return Math.min(4, met + (met === PASSWORD_RULES.length ? bonus : 0));
}
