// Landing page marketing content and demo-visualization data — kept
// separate from the section components themselves (README/Phase 3 rule:
// don't hardcode content inside visual components). None of this is
// production/user data; it's static marketing copy plus clearly-labeled
// product-preview mockups used only to illustrate how the real features work.

export const NAV_LINKS = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#features', label: 'Features' },
  { href: '#safety', label: 'Safety' },
  { href: '#families', label: 'For Families' },
];

export const JOURNEY_STEPS = [
  {
    n: '01',
    title: 'Understand',
    body: "Guidia explains unfamiliar screens, buttons, messages, and digital terms in plain language — no jargon, no assumptions.",
  },
  {
    n: '02',
    title: 'Practice',
    body: 'Users can safely rehearse digital actions — sending a message, making a payment — without any real-world consequence.',
  },
  {
    n: '03',
    title: 'Stay Safe',
    body: 'Guidia identifies suspicious links, messages, and requests before they become a problem, and explains why.',
  },
  {
    n: '04',
    title: 'Remember',
    body: 'Lessons and successful actions are saved to a personal Memory Book, so nothing has to be relearned from scratch.',
  },
];

export const FEATURE_CARDS = [
  {
    id: 'screenshot',
    title: 'AI Screenshot Understanding',
    body: "See something unfamiliar? Guidia explains what you're looking at and what each important element means.",
  },
  {
    id: 'practice',
    title: 'Safe Practice',
    body: 'Learn by doing, without the risk — every simulated environment is clearly labeled and never touches a real account.',
  },
  {
    id: 'assistant',
    title: 'AI Assistant',
    body: 'Ask naturally, in your own words. Get an answer built for understanding, not a wall of technical text.',
  },
  {
    id: 'scam',
    title: 'Scam Protection',
    body: 'Know what deserves a second look — messages, links, and requests are checked and explained in plain language.',
  },
  {
    id: 'memory',
    title: 'Memory Book',
    body: "Keep the things you've learned close, and revisit them any time without repeating a whole tutorial.",
  },
  {
    id: 'guardian',
    title: 'Family Guardian',
    body: 'Bring a trusted person in when it matters — always with explicit consent, never silent monitoring.',
  },
];

// Demo-only: illustrates the screenshot-explanation flow. Not a real
// analysis result — the real feature (Phase 8) calls a vision model.
export const SCREENSHOT_DEMO = {
  messageSender: 'MyBank Alerts',
  messageTime: '2 minutes ago',
  messageBody: 'Your account needs verification. Tap the link below to confirm your details before access is suspended.',
  whatYouSee: "This message is asking you to verify your account by tapping a link.",
  whatToCheck: 'Look at the sender name before opening any link — real banks rarely message this way.',
  actions: ['Explain this', 'Ask Family', "I'm not sure"],
};

// Demo-only: illustrates the Psychological Safety Net pattern that the
// real Safe Practice sims use (see GuidiaSafetyPanel in the authenticated app).
export const PRACTICE_DEMO = {
  app: 'Payments',
  recipient: 'Rahim Ahmed',
  amount: '৳2,500',
  question: 'Is everything correct?',
  actions: ['Edit', 'Ask Family', 'Continue'],
};

// Demo-only: illustrates the scam-detection explanation format. The real
// feature (Phase 10) runs a deterministic rule engine plus optional AI
// interpretation — see Safety.jsx in the authenticated app for the live tool.
export const SAFETY_DEMO = {
  risk: 'High',
  reason: 'The message asks you to share an OTP. Legitimate services never ask you to share a one-time code.',
  guidance: 'Do not share the code.',
  actions: ['Learn why', 'Ask Family', 'Go Back'],
};

export const GUARDIAN_PREVIEW_ITEMS = [
  { label: 'Pending approval', detail: 'Transfer of ৳2,500 to Rahim Ahmed', tone: 'warning' },
  { label: 'Resolved alert', detail: 'Suspicious link reported and blocked', tone: 'success' },
  { label: 'Trusted contact', detail: 'Rupa (Daughter) — accepted invitation', tone: 'neutral' },
];

export const MEMORY_PREVIEW_ITEMS = [
  { title: 'How to send a WhatsApp message', meta: 'Saved lesson' },
  { title: 'How to identify a suspicious link', meta: 'Saved safety check' },
  { title: 'How to make a safe payment', meta: 'Practice replay' },
  { title: 'How to join a video call', meta: 'Saved lesson' },
];

export const ACCESSIBILITY_CONTROLS = [
  { label: 'Text size', detail: 'Adjustable, up to large print' },
  { label: 'High contrast', detail: 'For low-vision clarity' },
  { label: 'English / বাংলা', detail: 'Full bilingual support' },
  { label: 'Voice guidance', detail: 'Spoken instructions, adjustable speed' },
  { label: 'Captions', detail: 'Text alongside every spoken explanation' },
  { label: 'Reduced motion', detail: 'Calmer, motion-free interface' },
];

export const COMFORT_STATES = [
  { id: 'calm', label: 'Calm', desc: 'Standard pacing and detail.' },
  { id: 'unsure', label: 'Unsure', desc: 'More explanation, slightly slower.' },
  { id: 'scared', label: 'Scared', desc: 'One step at a time, maximum reassurance.' },
];

// Every link here points somewhere real (a section on this page or an
// actual in-app route) — no "#" placeholders. About/Contact/Privacy pages
// don't exist yet, so they're left out entirely rather than faked.
export const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Safety', href: '#safety' },
    { label: 'Family Guardian', href: '#families' },
  ],
  Resources: [
    { label: 'Accessibility', href: '#accessibility' },
    { label: 'Security', href: '#safety' },
    { label: 'Help', href: '/app/emergency' },
  ],
};
