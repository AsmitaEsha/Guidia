import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import sharp from 'sharp';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';
import { mockProvider } from '../../src/ai/providers/mockProvider.js';

const app = createApp();
const ORIGIN = 'http://localhost:5173';
let n = 0;
const uniqueEmail = (p) => `${p}.${Date.now()}.${n++}@test.guidia`;

async function register(prefix = 'senior', language = 'en') {
  const agent = request.agent(app);
  const email = uniqueEmail(prefix);
  const res = await agent.post('/api/v1/auth/register').set('Origin', ORIGIN)
    .send({ fullName: `${prefix} Tester`, email, password: 'Passw0rdX', confirmPassword: 'Passw0rdX', preferredLanguage: language });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return { agent, email, token: res.body.data.accessToken, user: res.body.data.user };
}

const auth = (t) => ({ Authorization: `Bearer ${t}` });
const idem = () => ({ 'Idempotency-Key': `k${Date.now()}${Math.random().toString(36).slice(2, 10)}` });

before(async () => { await prisma.$connect(); });
after(async () => { await prisma.$disconnect(); });

test('health: live and ready', async () => {
  assert.equal((await request(app).get('/api/v1/health/live')).status, 200);
  const ready = await request(app).get('/api/v1/health/ready');
  assert.equal(ready.status, 200);
  assert.equal(ready.body.data.checks.database, 'up');
});

test('auth: refresh rotates the token and reuse revokes the family', async () => {
  const { agent } = await register();
  const first = await agent.post('/api/v1/auth/refresh').set('Origin', ORIGIN);
  assert.equal(first.status, 200);
  const oldCookie = first.headers['set-cookie'];
  const second = await agent.post('/api/v1/auth/refresh').set('Origin', ORIGIN);
  assert.equal(second.status, 200);

  // Replaying a rotated token later (outside the grace window) = theft.
  await prisma.session.updateMany({ where: { revokeReason: 'rotated' }, data: { revokedAt: new Date(Date.now() - 60_000) } });
  const replay = await request(app).post('/api/v1/auth/refresh').set('Origin', ORIGIN).set('Cookie', oldCookie);
  assert.equal(replay.status, 401);
  const afterReuse = await agent.post('/api/v1/auth/refresh').set('Origin', ORIGIN);
  assert.equal(afterReuse.status, 401, 'whole family must be revoked after reuse');
});

test('auth: refresh from an untrusted origin is refused', async () => {
  const { agent } = await register();
  const res = await agent.post('/api/v1/auth/refresh').set('Origin', 'https://evil.example');
  assert.equal(res.status, 403);
});

test('auth: reset tokens are stored hashed', async () => {
  const { email } = await register();
  await request(app).post('/api/v1/auth/forgot-password').send({ email });
  const row = await prisma.passwordResetToken.findFirst({ orderBy: { createdAt: 'desc' } });
  assert.match(row.tokenHash, /^[a-f0-9]{64}$/);
  const outbox = await prisma.outboxEvent.findFirst({ where: { type: 'EMAIL' }, orderBy: { createdAt: 'desc' } });
  assert.equal(outbox.payload.template, 'password_reset');
});

test('profile: age and preferences persist server-side (Vietnamese accepted)', async () => {
  const { token } = await register();
  const p = await request(app).patch('/api/v1/users/me').set(auth(token)).send({ age: 68 });
  assert.equal(p.body.data.user.age, 68);
  const prefs = await request(app).put('/api/v1/users/me/preferences').set(auth(token)).send({ preferredLanguage: 'vi', onboardingDone: true, notificationsEnabled: false });
  assert.equal(prefs.status, 200);
  assert.equal(prefs.body.data.user.preferredLanguage, 'vi');
  assert.equal(prefs.body.data.user.preference.onboardingDone, true);
  assert.equal(prefs.body.data.user.preference.notificationsEnabled, false);
});

test('assistant: secrets are redacted before storage', async () => {
  const { token, user } = await register();
  const res = await request(app).post('/api/v1/assistant/message').set(auth(token)).send({ message: 'My OTP is 583921, what should I do?', language: 'en' });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(res.body.data.secretsRemoved, 1);
  const stored = await prisma.conversationMessage.findMany({ where: { conversation: { userId: user.id } } });
  assert.ok(stored.length >= 2);
  assert.ok(stored.every((m) => !m.content.includes('583921')));
});

test('safety: CRITICAL scam stays CRITICAL; benign advice is not flagged', async () => {
  const { token } = await register();
  const scam = await request(app).post('/api/v1/safety/analyze').set(auth(token))
    .send({ contentType: 'SMS', content: 'URGENT: your bKash account will be suspended today. Verify now: http://bkash-verify-now.com' });
  assert.equal(scam.body.data.severity, 'CRITICAL');
  const benign = await request(app).post('/api/v1/safety/analyze').set(auth(token))
    .send({ contentType: 'MESSAGE', content: 'Never share your OTP with anyone.' });
  assert.equal(benign.body.data.severity, 'SAFE');
});

test('actions: high-risk practice payment → 2 confirmations → guardian approval → executed once', async () => {
  const senior = await register('senior');
  const guardian = await register('guardian');

  const invite = await request(app).post('/api/v1/guardian/invite').set(auth(senior.token)).send({ guardianEmail: guardian.email, approvalThreshold: 500 });
  assert.equal(invite.status, 201);
  const relId = invite.body.data.relationship.id;
  assert.equal((await request(app).post(`/api/v1/guardian/${relId}/accept`).set(auth(guardian.token))).status, 200);

  const created = await request(app).post('/api/v1/actions').set(auth(senior.token))
    .send({ applicationSlug: 'bkash', actionType: 'SEND_MONEY', recipientLabel: 'Rahim', amount: 1500 });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  const proposal = created.body.data.proposal;
  assert.equal(proposal.status, 'REVIEW');
  assert.equal(proposal.confirmationLevel, 2);
  assert.equal(proposal.requiresGuardian, true);

  // Confirm without Idempotency-Key is refused.
  assert.equal((await request(app).post(`/api/v1/actions/${proposal.id}/confirm`).set(auth(senior.token)).send({})).status, 400);

  const c1 = await request(app).post(`/api/v1/actions/${proposal.id}/confirm`).set(auth(senior.token)).set(idem()).send({});
  assert.equal(c1.body.data.proposal.status, 'REVIEW');
  const key = idem();
  const c2 = await request(app).post(`/api/v1/actions/${proposal.id}/confirm`).set(auth(senior.token)).set(key).send({});
  assert.equal(c2.body.data.proposal.status, 'GUARDIAN_PENDING');
  // Same key replays; doesn't confirm again.
  const replay = await request(app).post(`/api/v1/actions/${proposal.id}/confirm`).set(auth(senior.token)).set(key).send({});
  assert.equal(replay.headers['idempotent-replay'], 'true');

  const approvals = await request(app).get('/api/v1/guardian/approvals/mine').set(auth(guardian.token));
  const approval = approvals.body.data.approvals.find((a) => a.actionProposalId === proposal.id);
  assert.ok(approval, 'guardian sees the request');

  const [a, b] = await Promise.all([
    request(app).post(`/api/v1/guardian/approvals/${approval.id}/resolve`).set(auth(guardian.token)).send({ status: 'APPROVED' }),
    request(app).post(`/api/v1/guardian/approvals/${approval.id}/resolve`).set(auth(guardian.token)).send({ status: 'APPROVED' }),
  ]);
  assert.deepEqual([a.status, b.status].sort(), [200, 409], 'exactly one approval wins');

  const final = await request(app).get(`/api/v1/actions/${proposal.id}`).set(auth(senior.token));
  assert.equal(final.body.data.proposal.status, 'EXECUTED');
  assert.equal(await prisma.simulationTransaction.count({ where: { actionProposalId: proposal.id } }), 1);

  const notes = await request(app).get('/api/v1/notifications').set(auth(senior.token));
  assert.ok(notes.body.data.items.some((i) => i.type === 'APPROVAL_RESULT'));
});

test('guardian: data is permission-scoped', async () => {
  const senior = await register('senior');
  const guardian = await register('guardian');
  const invite = await request(app).post('/api/v1/guardian/invite').set(auth(senior.token)).send({ guardianEmail: guardian.email, permissions: ['EMERGENCY_ALERTS'] });
  await request(app).post(`/api/v1/guardian/${invite.body.data.relationship.id}/accept`).set(auth(guardian.token));
  const overview = await request(app).get(`/api/v1/guardian/seniors/${senior.user.id}/overview`).set(auth(guardian.token));
  assert.equal(overview.status, 200);
  assert.equal(overview.body.data.overview.progress, undefined, 'no LEARNING_PROGRESS scope → no progress');
  const stranger = await register('stranger');
  assert.equal((await request(app).get(`/api/v1/guardian/seniors/${senior.user.id}/overview`).set(auth(stranger.token))).status, 404);
});

test('emergency: notifies guardians once and deduplicates repeat presses', async () => {
  const senior = await register('senior');
  const guardian = await register('guardian');
  const invite = await request(app).post('/api/v1/guardian/invite').set(auth(senior.token)).send({ guardianEmail: guardian.email });
  await request(app).post(`/api/v1/guardian/${invite.body.data.relationship.id}/accept`).set(auth(guardian.token));

  const first = await request(app).post('/api/v1/emergency').set(auth(senior.token)).send({ reason: 'I_AM_CONFUSED' });
  assert.equal(first.status, 201);
  assert.equal(first.body.data.event.status, 'SENT');
  const again = await request(app).post('/api/v1/emergency').set(auth(senior.token)).send({ reason: 'I_AM_CONFUSED' });
  assert.equal(again.body.data.event.id, first.body.data.event.id);
  assert.equal(await prisma.notification.count({ where: { userId: guardian.user.id, type: 'EMERGENCY' } }), 1);

  const ack = await request(app).post(`/api/v1/emergency/${first.body.data.event.id}/acknowledge`).set(auth(guardian.token));
  assert.equal(ack.body.data.event.status, 'ACKNOWLEDGED');
  // Senior can't "acknowledge" their own request.
  assert.equal((await request(app).post(`/api/v1/emergency/${first.body.data.event.id}/acknowledge`).set(auth(senior.token))).status, 403);
});

test('emergency without guardians is recorded honestly as not sent', async () => {
  const senior = await register('alone');
  const res = await request(app).post('/api/v1/emergency').set(auth(senior.token)).send({ reason: 'OTHER' });
  assert.equal(res.body.data.event.status, 'TRIGGERED');
  assert.equal(res.body.data.event.guardiansNotified, 0);
});

test('notifications: read state persists', async () => {
  const senior = await register('senior');
  const guardian = await register('guardian');
  await request(app).post('/api/v1/guardian/invite').set(auth(senior.token)).send({ guardianEmail: guardian.email });
  const list = await request(app).get('/api/v1/notifications').set(auth(guardian.token));
  assert.equal(list.body.data.unreadCount, 1);
  await request(app).post(`/api/v1/notifications/${list.body.data.items[0].id}/read`).set(auth(guardian.token));
  const again = await request(app).get('/api/v1/notifications').set(auth(guardian.token));
  assert.equal(again.body.data.unreadCount, 0);
});

test('vision: real image required, owner-only access', async () => {
  const owner = await register('viewer');
  const other = await register('other');
  const png = await sharp({ create: { width: 40, height: 30, channels: 3, background: '#ffffff' } }).png().toBuffer();

  const fake = await request(app).post('/api/v1/vision/analyze').set(auth(owner.token)).attach('screenshot', Buffer.from('not an image'), { filename: 'x.png', contentType: 'image/png' });
  assert.equal(fake.status, 400);

  const res = await request(app).post('/api/v1/vision/analyze').set(auth(owner.token)).field('language', 'bn').attach('screenshot', png, { filename: 's.png', contentType: 'image/png' });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  const id = res.body.data.analysis.id;
  assert.equal((await request(app).get(`/api/v1/vision/${id}`).set(auth(owner.token))).status, 200);
  assert.equal((await request(app).get(`/api/v1/vision/${id}`).set(auth(other.token))).status, 404);
  assert.equal((await request(app).get(`/api/v1/vision/${id}/image`).set(auth(other.token))).status, 404);
  assert.equal((await request(app).get(`/api/v1/screenshots/sessions/${id}`)).status, 401, 'no anonymous access');
});

test('extension: pairing code → scoped token that only works for capture', async () => {
  const { token } = await register('ext');
  const pairing = await request(app).post('/api/v1/extension/pairing').set(auth(token));
  const exchange = await request(app).post('/api/v1/extension/exchange').send({ code: pairing.body.data.code });
  assert.equal(exchange.status, 200);
  const extToken = exchange.body.data.token;
  assert.match(extToken, /^gx_/);
  assert.equal((await request(app).post('/api/v1/extension/exchange').send({ code: pairing.body.data.code })).status, 400, 'code is single-use');
  assert.equal((await request(app).get('/api/v1/memory').set(auth(extToken))).status, 401, 'extension token is not a session');

  const png = await sharp({ create: { width: 20, height: 20, channels: 3, background: '#000' } }).png().toBuffer();
  const capture = await request(app).post('/api/v1/vision/sessions').set(auth(extToken)).attach('screenshot', png, { filename: 'c.png', contentType: 'image/png' });
  assert.equal(capture.status, 201);
});

test('learning: lesson completion updates skill + memory atomically', async () => {
  const { token, user } = await register('learner');
  const lessons = await request(app).get('/api/v1/learning/lessons').set(auth(token));
  assert.ok(lessons.body.data.lessons.length >= 10);
  const done = await request(app).post('/api/v1/learning/lessons/whatsapp-send-message/complete').set(auth(token)).send({ confidence: 3 });
  assert.equal(done.status, 200);
  assert.equal(done.body.data.skill.masteryLevel, 'PRACTICING');
  const progress = await request(app).get('/api/v1/progress/me').set(auth(token));
  assert.equal(progress.body.data.progress.lessonsCompleted, 1);
  assert.equal(progress.body.data.progress.confidence, 60);
  assert.equal(await prisma.memoryBookEntry.count({ where: { userId: user.id } }), 1);
});

test('tasks: a practice session survives a "refresh" and records independence', async () => {
  const { token } = await register('practiser');
  const start = await request(app).post('/api/v1/tasks').set(auth(token)).send({ scenarioSlug: 'whatsapp-wa1' });
  assert.equal(start.status, 201);
  const active = await request(app).get('/api/v1/tasks/active').set(auth(token));
  assert.equal(active.body.data.task.id, start.body.data.task.id);
  const done = await request(app).post(`/api/v1/tasks/${start.body.data.task.id}/complete`).set(auth(token)).send({ outcome: 'SUCCESS' });
  assert.equal(done.body.data.independent, true);
  assert.equal(done.body.data.skill.masteryLevel, 'INDEPENDENT');
});

test('mock provider structured output is validated', async () => {
  const { token } = await register();
  mockProvider.setNextStructured({ reply: 'x', steps: 'not-an-array' });
  const res = await request(app).post('/api/v1/assistant/message').set(auth(token)).send({ message: 'How do I send a WhatsApp message?' });
  assert.equal(res.status, 502);
  assert.equal(res.body.error.code, 'AI_BAD_OUTPUT');
});

test('assistant: conversations are titled from the first (redacted) question', async () => {
  const { token } = await register();
  const first = await request(app).post('/api/v1/assistant/message').set(auth(token)).send({ message: 'My PIN is 4821, how do I send a photo?', language: 'en' });
  assert.equal(first.status, 200);
  await request(app).post('/api/v1/assistant/message').set(auth(token)).send({ message: 'And a video?', language: 'en', conversationId: first.body.data.conversationId });
  const list = await request(app).get('/api/v1/assistant/conversations').set(auth(token));
  const convo = list.body.data.conversations.find((c) => c.id === first.body.data.conversationId);
  assert.ok(convo.title, 'conversation has a title');
  assert.ok(!convo.title.includes('4821'), 'title never contains the secret');
  assert.match(convo.title, /send a photo/);
});

test('learning: everyday-app lessons exist in all four languages', async () => {
  const { token } = await register();
  const res = await request(app).get('/api/v1/learning/lessons').set(auth(token));
  const slugs = ['facebook-share-photo', 'nagad-send-money-safely', 'gmail-spot-fake-email', 'imo-protect-account'];
  for (const slug of slugs) {
    const lesson = res.body.data.lessons.find((l) => l.slug === slug);
    assert.ok(lesson, `${slug} is published`);
    for (const lang of ['en', 'bn', 'hi', 'vi']) assert.ok(lesson.title[lang], `${slug} has a ${lang} title`);
  }
  const detail = await request(app).get('/api/v1/learning/lessons/imo-video-call').set(auth(token));
  assert.equal(detail.status, 200);
  for (const step of detail.body.data.lesson.steps) for (const lang of ['en', 'bn', 'hi', 'vi']) assert.ok(step.body[lang]);
});
