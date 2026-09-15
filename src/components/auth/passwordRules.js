export const PASSWORD_RULES = [
  { test: (p) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p) => /[0-9]/.test(p), label: 'A number' },
  { test: (p) => /[A-Z]/.test(p) && /[a-z]/.test(p), label: 'An uppercase and a lowercase letter' },
];

export function isPasswordStrong(password) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
