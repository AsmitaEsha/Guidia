// Detects and redacts secrets in free text before it reaches an AI provider,
// the database, logs, notifications or the Memory Book.
//
// Design: keyword-anchored patterns for short secrets (an OTP is just digits
// — "583921" alone is not provably an OTP, "my OTP is 583921" is), and
// structural patterns for long ones (card numbers pass Luhn, JWTs and API
// keys have recognisable shapes). Phone numbers and emails are NOT redacted:
// they identify recipients the user is asking about and are not credentials.
//
// The guard is a defence layer, not a guarantee — prompts also tell the
// model never to ask for or repeat credentials.

const KW = {
  otp: '(?:otp|one[\\s-]?time\\s*(?:password|code|pin)|verification\\s*code|security\\s*code|auth(?:entication)?\\s*code|code|ওটিপি|কোড|ভেরিফিকেশন\\s*কোড|ओटीपी|कोड|mã\\s*otp|mã\\s*xác\\s*(?:nhận|thực)|mã)',
  pin: '(?:pin|পিন|पिन|mã\\s*pin)',
  password: '(?:password|passcode|passwd|pwd|পাসওয়ার্ড|পাসওয়ার্ড|পাসওয়ার্ড|पासवर्ड|mật\\s*khẩu)',
  cvv: '(?:cvv2?|cvc2?|card\\s*security\\s*code)',
  account: '(?:(?:bank\\s*)?a\\/?c(?:count)?\\s*(?:no\\.?|number|#)?|account|অ্যাকাউন্ট\\s*নম্বর|একাউন্ট\\s*নম্বর|खाता\\s*संख्या|खाता\\s*नंबर|số\\s*tài\\s*khoản|iban)',
  nid: '(?:nid|national\\s*id(?:entity)?(?:\\s*(?:card|number|no\\.?))?|এনআইডি|জাতীয়\\s*পরিচয়পত্র(?:\\s*নম্বর)?|aadhaa?r|आधार|cccd|cmnd|căn\\s*cước)',
  passport: '(?:passport(?:\\s*(?:no\\.?|number))?|পাসপোর্ট|पासपोर्ट|hộ\\s*chiếu)',
};

// Up to ~24 non-digit connector characters between keyword and value:
// "OTP is", "PIN:", "code - ", "পিন হলো ".
const GAP = '[^\\p{N}\\n]{0,24}?';
// Keywords must stand alone: "a/c" must not match inside "REDACTED".
const B = '(?<![\\p{L}\\p{N}_])';
const E = '(?![\\p{L}])';

const RULES = [
  {
    type: 'PASSWORD',
    re: new RegExp(`${B}(${KW.password})${E}(\\s*(?:is|=|:|-|হলো|হল|है|là)?\\s*)(\\S{3,64})`, 'giu'),
    replace: (m, kw, sep) => `${kw}${sep}[REDACTED_PASSWORD]`,
  },
  {
    type: 'CVV',
    re: new RegExp(`${B}(${KW.cvv})${E}(${GAP})(\\p{N}{3,4})(?!\\p{N})`, 'giu'),
    replace: (m, kw, gap) => `${kw}${gap}[REDACTED_CVV]`,
  },
  {
    type: 'PIN',
    re: new RegExp(`${B}(${KW.pin})${E}(${GAP})(\\p{N}{4,6})(?!\\p{N})`, 'giu'),
    replace: (m, kw, gap) => `${kw}${gap}[REDACTED_PIN]`,
  },
  {
    type: 'OTP',
    re: new RegExp(`${B}(${KW.otp})${E}(${GAP})(\\p{N}{4,8})(?!\\p{N})`, 'giu'),
    replace: (m, kw, gap) => `${kw}${gap}[REDACTED_OTP]`,
  },
  {
    type: 'NID',
    re: new RegExp(`${B}(${KW.nid})${E}(${GAP})([\\p{N}][\\p{N}\\s-]{8,20}[\\p{N}])`, 'giu'),
    replace: (m, kw, gap) => `${kw}${gap}[REDACTED_NID]`,
  },
  {
    type: 'PASSPORT',
    re: new RegExp(`${B}(${KW.passport})${E}(\\s*(?:is|=|:|-|no\\.?|number)?\\s*)([A-Z]{1,2}\\d{6,8})`, 'giu'),
    replace: (m, kw, sep) => `${kw}${sep}[REDACTED_PASSPORT]`,
  },
  {
    type: 'BANK_ACCOUNT',
    re: new RegExp(`${B}(${KW.account})${E}(${GAP})([\\p{N}][\\p{N}\\s-]{6,24}[\\p{N}])`, 'giu'),
    replace: (m, kw, gap) => `${kw}${gap}[REDACTED_ACCOUNT]`,
  },
];

// Structural secrets — no keyword needed.
const STRUCTURAL = [
  { type: 'JWT', re: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g },
  { type: 'API_KEY', re: /\b(?:sk|pk|rk|xai|hf|ghp|gho|glpat|AKIA)[-_][A-Za-z0-9_-]{16,}\b/g },
  { type: 'API_KEY', re: /\bAKIA[0-9A-Z]{16}\b/g },
  { type: 'BEARER_TOKEN', re: /\bBearer\s+[A-Za-z0-9._~+/-]{16,}=*/gi },
  { type: 'SECRET_HEX', re: /\b[a-f0-9]{40,}\b/gi },
];

function luhnValid(digits) {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = digits.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

// Converts Bengali/Devanagari digits to ASCII so card/Luhn checks work on
// any script.
function asciiDigits(s) {
  return s.replace(/[০-৯]/g, (c) => String(c.charCodeAt(0) - 0x09e6))
    .replace(/[०-९]/g, (c) => String(c.charCodeAt(0) - 0x0966));
}

const CARD_CANDIDATE = /(?<![\p{N}])(?:[\p{N}][ -]?){13,19}(?![\p{N}])/gu;

/**
 * @param {string} input
 * @returns {{ text: string, redactions: Record<string, number>, count: number }}
 */
export function redactSensitive(input) {
  if (typeof input !== 'string' || input.length === 0) {
    return { text: input ?? '', redactions: {}, count: 0 };
  }
  const redactions = {};
  const bump = (type) => { redactions[type] = (redactions[type] || 0) + 1; };
  let text = input;

  for (const { type, re } of STRUCTURAL) {
    text = text.replace(re, () => { bump(type); return `[REDACTED_${type}]`; });
  }

  text = text.replace(CARD_CANDIDATE, (match) => {
    const digits = asciiDigits(match).replace(/\D/g, '');
    if (digits.length >= 13 && digits.length <= 19 && luhnValid(digits)) {
      bump('CARD_NUMBER');
      // Preserve trailing whitespace the candidate may have swallowed.
      return `[REDACTED_CARD]${/\s$/.test(match) ? ' ' : ''}`;
    }
    return match;
  });

  for (const { type, re, replace } of RULES) {
    text = text.replace(re, (...args) => { bump(type); return replace(...args); });
  }

  const count = Object.values(redactions).reduce((a, b) => a + b, 0);
  return { text, redactions, count };
}

export function containsSensitive(input) {
  return redactSensitive(input).count > 0;
}

const SENSITIVE_KEYS = /pass(word)?|secret|token|otp|pin$|^pin|cvv|cvc|authorization|cookie|api[-_]?key|card(number)?$/i;

// Deep-redacts an object for logging: sensitive keys are masked entirely,
// string values are passed through redactSensitive.
export function redactObject(value, depth = 0) {
  if (depth > 6) return '[TRUNCATED]';
  if (typeof value === 'string') return redactSensitive(value).text;
  if (Array.isArray(value)) return value.map((v) => redactObject(v, depth + 1));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = SENSITIVE_KEYS.test(k) ? '[REDACTED]' : redactObject(v, depth + 1);
    }
    return out;
  }
  return value;
}
