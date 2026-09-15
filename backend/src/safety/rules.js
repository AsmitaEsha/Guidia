// Deterministic scam/phishing signal detection. This is the floor: AI
// interpretation (see safetyService.js) may only raise the severity this
// module produces, never lower it — a financial-safety verdict must never
// rest on an LLM alone.

const SEVERITY_RANK = { SAFE: 0, WARNING: 1, HIGH_RISK: 2, CRITICAL: 3 };
export function maxSeverity(a, b) {
  return SEVERITY_RANK[a] >= SEVERITY_RANK[b] ? a : b;
}

const URL_SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'ow.ly', 'cutt.ly', 'shorturl.at', 'rb.gy', 'buff.ly'];
const BRAND_TOKENS = ['bkash', 'nagad', 'rocket', 'paypal', 'google', 'facebook', 'gmail', 'whatsapp', 'amazon', 'bank', 'brac'];

const URGENCY_PATTERNS = [
  /\burgent\b/i, /\bact now\b/i, /\bimmediately\b/i, /\btoday only\b/i,
  /\bwithin\s+\d+\s*(hours?|minutes?)\b/i, /\bwill be suspended\b/i, /\bexpires? (today|soon)\b/i,
  /\bverify now\b/i, /জরুরি/, /এখনই/, /অবিলম্বে/,
];

const CREDENTIAL_REQUEST_PATTERNS = [
  /\botp\b/i, /\bone[\s-]?time password\b/i, /\bverification code\b/i,
  /\bpin\b/i, /\bpassword\b/i, /ওটিপি/, /পিন/, /পাসওয়ার্ড/,
];

const PAYMENT_REQUEST_PATTERNS = [
  /\bprocessing fee\b/i, /\bsend money to claim\b/i, /\bpay to receive\b/i,
  /\bgift card\b/i, /\bwire transfer\b/i, /\bclaim your prize\b/i,
];

const PRIZE_PATTERNS = [
  /\byou('| )?(have\s+)?won\b/i, /\bcongratulations\b.*\b(prize|selected|winner)\b/i, /\blottery\b/i,
];

const IMPERSONATION_PATTERNS = [
  /\b(bkash|nagad|rocket|paypal|your bank|customer support|tax office|government)\b.*\b(calling|writing|contacting)\b/i,
  /\bwe are from\b/i, /\bofficial (notice|message) from\b/i,
];

function extractUrls(text) {
  return text.match(/\bhttps?:\/\/[^\s]+/gi) || [];
}

function analyzeUrl(url) {
  const signals = [];
  let lower = url.toLowerCase();
  let host = '';
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    host = lower;
  }

  if (/^\d{1,3}(\.\d{1,3}){3}/.test(host)) {
    signals.push({ severity: 'HIGH_RISK', reason: 'The link points to a raw numeric address instead of a normal website name — a common way to disguise a fake site.' });
  }

  if (URL_SHORTENERS.some((s) => host.includes(s))) {
    signals.push({ severity: 'WARNING', reason: 'The link uses a link-shortening service, which hides the real destination until you click it.' });
  }

  const brandInHost = BRAND_TOKENS.find((b) => host.includes(b));
  if (brandInHost) {
    const looksOfficial = host === `${brandInHost}.com` || host.endsWith(`.${brandInHost}.com`);
    if (!looksOfficial) {
      signals.push({ severity: 'HIGH_RISK', reason: `The link's address contains "${brandInHost}" but is not that company's real website — a common phishing trick.`, spoofedBrand: true });
    }
  }

  return signals;
}

// content: the raw text (URL, SMS, or message) submitted for analysis.
// Returns { severity, signals: [{severity, reason}] } — signals is never
// empty when severity !== 'SAFE', so the UI always has something concrete
// to show under "what looks suspicious."
export function runRuleEngine(content) {
  const signals = [];
  let severity = 'SAFE';
  let hasSpoofedLink = false;

  for (const url of extractUrls(content)) {
    for (const s of analyzeUrl(url)) {
      signals.push(s);
      severity = maxSeverity(severity, s.severity);
      if (s.spoofedBrand) hasSpoofedLink = true;
    }
  }

  const hasUrgency = URGENCY_PATTERNS.some((p) => p.test(content));
  const hasCredentialRequest = CREDENTIAL_REQUEST_PATTERNS.some((p) => p.test(content));
  const hasPaymentRequest = PAYMENT_REQUEST_PATTERNS.some((p) => p.test(content));
  const hasPrizeLanguage = PRIZE_PATTERNS.some((p) => p.test(content));
  const hasImpersonation = IMPERSONATION_PATTERNS.some((p) => p.test(content));

  if (hasUrgency) {
    signals.push({ severity: 'WARNING', reason: 'The message creates a false sense of urgency to pressure you into acting without thinking.' });
    severity = maxSeverity(severity, 'WARNING');
  }
  if (hasPrizeLanguage) {
    signals.push({ severity: 'WARNING', reason: 'The message claims you won a prize or lottery you never entered.' });
    severity = maxSeverity(severity, 'WARNING');
  }
  if (hasCredentialRequest) {
    signals.push({ severity: 'HIGH_RISK', reason: 'The message asks for a PIN, password, or one-time code. Real organizations never ask for these.' });
    severity = maxSeverity(severity, 'HIGH_RISK');
  }
  if (hasPaymentRequest) {
    signals.push({ severity: 'HIGH_RISK', reason: 'The message asks you to pay or send money upfront to "claim" or "receive" something.' });
    severity = maxSeverity(severity, 'HIGH_RISK');
  }
  if (hasImpersonation && (hasUrgency || hasCredentialRequest)) {
    signals.push({ severity: 'CRITICAL', reason: 'The message impersonates a trusted organization while pressuring you or asking for sensitive information — a classic scam combination.' });
    severity = maxSeverity(severity, 'CRITICAL');
  }
  if (hasCredentialRequest && hasUrgency) {
    severity = maxSeverity(severity, 'CRITICAL');
  }
  if (hasSpoofedLink && hasUrgency) {
    signals.push({ severity: 'CRITICAL', reason: 'A fake-looking link combined with urgent, scary language is a classic phishing pattern designed to make you act before you think.' });
    severity = maxSeverity(severity, 'CRITICAL');
  }

  // De-duplicate identical reasons.
  const seen = new Set();
  const uniqueSignals = signals.filter((s) => {
    const key = `${s.severity}:${s.reason}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { severity, signals: uniqueSignals };
}

const GUIDANCE_BY_SEVERITY = {
  SAFE: {
    whatToDo: ['No specific danger signs were found, but always stay cautious with unfamiliar messages and links.'],
    whatToAvoid: ['Avoid sharing your PIN, password, or OTP with anyone, even if a message looks safe.'],
  },
  WARNING: {
    whatToDo: ['Pause before acting.', 'Verify the sender through an official app or phone number you already trust — not a number or link from the message itself.'],
    whatToAvoid: ["Don't click the link or reply with any personal details until you've verified it."],
  },
  HIGH_RISK: {
    whatToDo: ['Do not respond to this message.', 'Contact the organization directly using a number from their official website or app.', 'If unsure, ask a trusted family member or your guardian before doing anything.'],
    whatToAvoid: ['Never share your PIN, password, or OTP — no real organization will ever ask for these.', "Don't click any links in this message."],
  },
  CRITICAL: {
    whatToDo: ['Stop immediately — do not click, reply, or share anything.', 'Delete or report the message.', 'Tell a trusted family member or guardian right away.'],
    whatToAvoid: ['Never share a PIN, password, OTP, or send money because of this message.', 'Never call a number provided inside a suspicious message.'],
  },
};

export function guidanceFor(severity) {
  return GUIDANCE_BY_SEVERITY[severity] || GUIDANCE_BY_SEVERITY.SAFE;
}
