// End-to-end check of every backend area against a RUNNING API.
//
//   npm --prefix backend run check            (API at http://localhost:8000)
//   API_URL=https://api.example.org npm --prefix backend run check
//
// Creates a throwaway account (check.<time>@example.com), walks through
// auth, preferences, learning, practice tasks, memory, progress, safety,
// assistant, vision, trusted people, help requests, notifications,
// sessions, extension pairing and data export, then deletes the account.
// AI-backed steps are reported as warnings (not failures) when the AI
// provider is slow or switched off, because Guidia falls back gracefully.
import sharp from 'sharp';

const BASE = (process.env.API_URL || 'http://localhost:8000').replace(/\/$/, '') + '/api/v1';
const ORIGIN = process.env.CHECK_ORIGIN || 'http://localhost:5173';
const PASSWORD = 'Check1234x';
let token = null;
let cookie = '';
const results = [];

async function call(method, path, { body, form, idem, expect = [200, 201, 204], timeout = 20_000 } = {}) {
  const headers = { Origin: ORIGIN };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (cookie) headers.Cookie = cookie;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (idem) headers['Idempotency-Key'] = `chk${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
  const res = await fetch(`${BASE}${path}`, { method, headers, body: form ?? (body !== undefined ? JSON.stringify(body) : undefined), signal: AbortSignal.timeout(timeout) });
  const set = res.headers.get('set-cookie');
  if (set) cookie = set.split(';')[0];
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* not JSON */ }
  if (!expect.includes(res.status)) {
    const msg = json?.error?.message || text.slice(0, 160) || res.statusText;
    throw new Error(`${method} ${path} → ${res.status}: ${msg}`);
  }
  return json?.data ?? json;
}

async function step(name, fn, { optional = false } = {}) {
  const t0 = Date.now();
  try {
    const note = await fn();
    results.push({ name, ok: true, ms: Date.now() - t0, note });
    console.log(`  ✔ ${name}${note ? ` — ${note}` : ''}`);
  } catch (err) {
    results.push({ name, ok: false, optional, ms: Date.now() - t0, note: err.message });
    console.log(`  ${optional ? '⚠' : '✖'} ${name} — ${err.message}`);
  }
}

console.log(`\nGuidia API check → ${BASE}\n`);
const email = `check.${Date.now()}@example.com`;
let lessonSlug; let scenario; let task; let memoryId; let assessmentId; let conversationId; let relId; let emergencyId;

await step('Health: live', async () => { await call('GET', '/health/live'); });
await step('Health: ready (database)', async () => { const d = await call('GET', '/health/ready'); return `database ${d.checks.database}, AI ${d.checks.ai ?? 'n/a'}`; });
await step('Config / capabilities', async () => { const d = await call('GET', '/config'); return Object.entries(d.capabilities).filter(([, v]) => v).map(([k]) => k).join(', '); });

await step('Auth: register', async () => { const d = await call('POST', '/auth/register', { body: { fullName: 'API Check', email, password: PASSWORD, confirmPassword: PASSWORD, preferredLanguage: 'en' } }); token = d.accessToken; return email; });
await step('Auth: weak password is refused', async () => { await call('POST', '/auth/register', { body: { fullName: 'X', email: `weak.${email}`, password: 'short', confirmPassword: 'short' }, expect: [400] }); });
await step('Auth: invalid email is refused', async () => { await call('POST', '/auth/register', { body: { fullName: 'X', email: 'not-an-email', password: PASSWORD, confirmPassword: PASSWORD }, expect: [400] }); });
await step('Auth: login', async () => { const d = await call('POST', '/auth/login', { body: { email: email.toUpperCase(), password: PASSWORD } }); token = d.accessToken; return 'email is case-insensitive'; });
await step('Auth: refresh session (cookie)', async () => { const d = await call('POST', '/auth/refresh'); token = d.accessToken; });
await step('Auth: wrong password is refused', async () => { const keep = token; token = null; await call('POST', '/auth/login', { body: { email, password: 'Wrong1234x' }, expect: [401] }); token = keep; });
await step('Profile + preferences', async () => {
  await call('PATCH', '/users/me', { body: { age: 70 } });
  const d = await call('PUT', '/users/me/preferences', { body: { onboardingDone: true, preferredLanguage: 'bn', fontSize: 22 } });
  return `language ${d.user.preferredLanguage}, text ${d.user.preference.fontSize}px`;
});

await step('Learning: lessons', async () => { const d = await call('GET', '/learning/lessons'); lessonSlug = d.lessons.find((l) => l.slug === 'imo-voice-message')?.slug || d.lessons[0].slug; return `${d.lessons.length} lessons`; });
await step('Learning: lesson detail', async () => { const d = await call('GET', `/learning/lessons/${lessonSlug}`); return `${d.lesson.steps.length} steps`; });
await step('Learning: complete lesson → skill + memory', async () => { await call('POST', `/learning/lessons/${lessonSlug}/complete`, { body: { language: 'en', confidence: 5 }, idem: true }); });
await step('Practice: applications', async () => { const d = await call('GET', '/learning/applications'); return `${d.applications.length} apps`; });
await step('Practice: scenarios', async () => { const d = await call('GET', '/learning/scenarios?application=whatsapp'); scenario = d.scenarios[0]; return `${d.scenarios.length} WhatsApp scenarios`; });
await step('Tasks: start → step → hint → complete', async () => {
  const s = await call('POST', '/tasks', { body: { scenarioSlug: scenario.slug, applicationSlug: 'whatsapp', language: 'en' } });
  task = s.task;
  const a = await call('POST', `/tasks/${task.id}/actions`, { body: { action: 'STEP_DONE', version: task.version } });
  await call('POST', `/tasks/${task.id}/hint`);
  const active = await call('GET', '/tasks/active');
  await call('POST', `/tasks/${task.id}/complete`, { body: { outcome: 'SUCCESS', language: 'en' }, idem: true });
  return `step ${a.task.currentStepOrder}/${a.task.totalSteps}, resumable: ${Boolean(active.task)}`;
});

await step('Memory: list / add / star / delete', async () => {
  const added = await call('POST', '/memory', { body: { title: 'Check entry', category: 'LEARNING', summary: 'Created by the API check.' } });
  memoryId = added.entry?.id || added.id;
  await call('PATCH', `/memory/${memoryId}/star`, { body: { starred: true } });
  const list = await call('GET', '/memory?q=Check');
  await call('DELETE', `/memory/${memoryId}`);
  return `${list.entries.length} found by search`;
});
await step('Progress', async () => { const d = await call('GET', '/progress/me'); return `${d.progress.lessonsCompleted} lessons, ${d.progress.skills.length} skills`; });

await step('Safety: scam check', async () => {
  const d = await call('POST', '/safety/analyze', { body: { contentType: 'SMS', content: 'URGENT: your bKash account is blocked. Send your OTP to 01700000000 now', language: 'en' }, timeout: 60_000 });
  assessmentId = d.id;
  return d.severity;
});
await step('Safety: feedback', async () => { await call('POST', '/safety/feedback', { body: { assessmentId, verdict: 'HELPFUL' } }); });

await step('Assistant: message (AI or verified lesson)', async () => {
  const d = await call('POST', '/assistant/message', { body: { message: 'How do I send a photo on WhatsApp?', language: 'en' }, timeout: 120_000 });
  conversationId = d.conversationId;
  return `grounding ${d.grounding}${d.degraded ? ' (fallback)' : ''}`;
}, { optional: true });
await step('Assistant: conversation history', async () => {
  const d = await call('GET', '/assistant/conversations');
  if (conversationId) { await call('GET', `/assistant/conversations/${conversationId}`); await call('DELETE', `/assistant/conversations/${conversationId}`); }
  return `${d.conversations.length} conversation(s), titled: ${d.conversations[0]?.title ? 'yes' : 'n/a'}`;
}, { optional: true });

await step('Vision: screenshot explanation', async () => {
  const png = await sharp({ create: { width: 360, height: 640, channels: 3, background: '#ffffff' } })
    .composite([{ input: Buffer.from('<svg width="360" height="640"><rect x="20" y="40" width="320" height="60" fill="#fde2e1"/><text x="30" y="78" font-size="20" fill="#a11d2a">Enter your PIN to verify</text><rect x="40" y="520" width="280" height="56" rx="12" fill="#e2136e"/><text x="130" y="555" font-size="22" fill="#fff">Verify now</text></svg>'), top: 0, left: 0 }])
    .png().toBuffer();
  const form = new FormData();
  form.append('screenshot', new Blob([png], { type: 'image/png' }), 'check.png');
  form.append('language', 'en');
  const d = await call('POST', '/vision/analyze', { form, timeout: 150_000 });
  const id = d.analysis.id;
  await call('GET', `/vision/${id}`);
  await call('DELETE', `/vision/${id}`);
  return `risk ${d.analysis.result?.risk ?? 'n/a'}`;
}, { optional: true });

await step('Trusted people: invite / permissions / revoke', async () => {
  const inv = await call('POST', '/guardian/invite', { body: { guardianEmail: `helper.${email}`, permissions: ['EMERGENCY_ALERTS', 'SAFETY_ALERTS'] } });
  relId = inv.relationship.id;
  await call('PUT', `/guardian/${relId}/permissions`, { body: { permissions: ['EMERGENCY_ALERTS'], approvalThreshold: 1000 } });
  const list = await call('GET', '/guardian');
  await call('POST', `/guardian/${relId}/revoke`);
  return `${list.myTrustedPeople.length} invited`;
});
await step('Help request: send / list / cancel', async () => {
  const d = await call('POST', '/emergency', { body: { reason: 'I_AM_CONFUSED', message: 'API check' }, idem: true });
  emergencyId = d.event.id;
  await call('GET', '/emergency');
  await call('POST', `/emergency/${emergencyId}/cancel`, { body: {}, idem: true });
  return `status ${d.event.status} (no trusted person connected → honestly not sent)`;
});
await step('Notifications: list / read all', async () => { const d = await call('GET', '/notifications'); await call('POST', '/notifications/read-all', { body: {} }); return `${d.items.length} item(s)`; });
await step('Sessions', async () => { const d = await call('GET', '/auth/sessions'); return `${d.sessions.length} active`; });
await step('Browser helper pairing code', async () => { const d = await call('POST', '/extension/pairing', { body: {}, expect: [200, 201, 503] }); return d?.code ? 'code issued' : 'extension feature switched off'; });
await step('Data export', async () => { const d = await call('GET', '/users/me/export'); return `${Object.keys(d).length} sections`; });
await step('Password reset email is queued', async () => { await call('POST', '/auth/forgot-password', { body: { email } }); });
await step('Clean up: delete the check account', async () => { await call('DELETE', '/users/me', { body: { password: PASSWORD } }); });

const failed = results.filter((r) => !r.ok && !r.optional);
const warned = results.filter((r) => !r.ok && r.optional);
console.log(`\n${results.length - failed.length - warned.length} passed, ${warned.length} warning(s), ${failed.length} failed.`);
if (warned.length) console.log('Warnings are AI-dependent steps — check your AI provider settings (docs/FREE_AI_SETUP.md).');
process.exitCode = failed.length ? 1 : 0;
