import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { requireAuth } from '../middleware/auth.js';
import { handler, ok, parse } from '../lib/http.js';
import { ApiError } from '../middleware/errorHandler.js';
import { LANGUAGE_CODES } from '../config/languages.js';
import { prisma } from '../config/prisma.js';
import { userRepository } from '../repositories/userRepository.js';
import { toPublicUser } from '../services/authService.js';
import { audit, AUDIT } from '../services/auditService.js';
import { storage } from '../storage/storageProvider.js';

const router = Router();

const profileSchema = z.object({
  fullName: z.string().trim().min(1, 'Please enter a name.').max(120).optional(),
  // Optional and self-reported; never required, never used as ability.
  age: z.number().int().min(18, 'Please enter a valid age.').max(120, 'Please enter a valid age.').nullable().optional(),
  countryCode: z.string().length(2).toUpperCase().nullable().optional(),
}).strict();

const preferencesSchema = z.object({
  preferredLanguage: z.enum(LANGUAGE_CODES).optional(),
  cognitiveState: z.enum(['CALM', 'UNSURE', 'SCARED']).optional(),
  fontSize: z.number().int().min(16).max(32).optional(),
  darkMode: z.boolean().optional(),
  highContrast: z.boolean().optional(),
  reducedMotion: z.boolean().optional(),
  voiceEnabled: z.boolean().optional(),
  voiceSpeed: z.number().min(0.7).max(1.3).optional(),
  voiceAutoPlay: z.boolean().optional(),
  preferVoice: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
  onboardingDone: z.boolean().optional(),
}).strict();

router.use(requireAuth);

router.get('/me', handler(async (req, res) => {
  const user = await userRepository.findById(req.user.id);
  if (!user) throw new ApiError(404, 'Account not found.', 'NOT_FOUND');
  ok(res, { user: toPublicUser(user) });
}));

router.patch('/me', handler(async (req, res) => {
  const data = parse(profileSchema, req.body);
  if (!Object.keys(data).length) throw new ApiError(400, 'Nothing to update.', 'VALIDATION_ERROR');
  const user = await userRepository.updateProfile(req.user.id, data);
  await audit({ actorUserId: req.user.id, action: AUDIT.PROFILE_UPDATED, targetType: 'User', targetId: req.user.id, requestId: req.id, metadata: { fields: Object.keys(data) } });
  ok(res, { user: toPublicUser(user) });
}));

router.put('/me/preferences', handler(async (req, res) => {
  const data = parse(preferencesSchema, req.body);
  if (!Object.keys(data).length) throw new ApiError(400, 'Nothing to update.', 'VALIDATION_ERROR');
  ok(res, { user: toPublicUser(await userRepository.updatePreference(req.user.id, data)) });
}));

// Portable copy of the user's own data (no secrets, no other people's data).
router.get('/me/export', handler(async (req, res) => {
  const id = req.user.id;
  const [user, memory, skills, attempts, conversations, risk, emergencies, relationships, notifications, consents] = await Promise.all([
    userRepository.findById(id),
    prisma.memoryBookEntry.findMany({ where: { userId: id } }),
    prisma.userSkill.findMany({ where: { userId: id } }),
    prisma.practiceAttempt.findMany({ where: { userId: id } }),
    prisma.conversation.findMany({ where: { userId: id }, include: { messages: { select: { role: true, content: true, createdAt: true } } } }),
    prisma.riskAssessment.findMany({ where: { userId: id }, select: { contentType: true, contentExcerpt: true, severity: true, createdAt: true } }),
    prisma.emergencyEvent.findMany({ where: { seniorId: id }, select: { reason: true, status: true, createdAt: true, resolvedAt: true } }),
    prisma.guardianRelationship.findMany({ where: { OR: [{ seniorUserId: id }, { guardianUserId: id }] }, select: { guardianEmail: true, status: true, role: true, createdAt: true, permissions: { select: { scope: true, grantedAt: true, revokedAt: true } } } }),
    prisma.notification.findMany({ where: { userId: id }, select: { type: true, title: true, body: true, createdAt: true, readAt: true } }),
    prisma.consentRecord.findMany({ where: { userId: id } }),
  ]);
  await audit({ actorUserId: id, action: AUDIT.DATA_EXPORTED, targetType: 'User', targetId: id, requestId: req.id });
  res.setHeader('Content-Disposition', 'attachment; filename="guidia-my-data.json"');
  ok(res, { exportedAt: new Date().toISOString(), profile: toPublicUser(user), memory, skills, practiceAttempts: attempts, conversations, safetyChecks: risk, emergencies, trustedPeople: relationships, notifications, consents });
}));

// Deletes the account and everything that cascades from it. Requires the
// password so a stolen access token alone can't erase someone's account.
router.delete('/me', handler(async (req, res) => {
  const { password } = parse(z.object({ password: z.string().min(1).max(200) }), req.body ?? {});
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(403, 'That password is not correct.', 'INVALID_CREDENTIALS');
  }
  const screenshots = await prisma.screenshotAnalysis.findMany({ where: { userId: user.id, storageKey: { not: null } }, select: { storageKey: true } });
  await Promise.all(screenshots.map((s) => storage.remove(s.storageKey).catch(() => {})));
  // Audit row keeps no personal data beyond the (now dangling) id.
  await audit({ actorUserId: null, actorType: 'SYSTEM', action: AUDIT.ACCOUNT_DELETED, targetType: 'User', targetId: user.id, requestId: req.id });
  await prisma.$transaction([
    prisma.guardianRelationship.updateMany({ where: { guardianUserId: user.id }, data: { status: 'REVOKED' } }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);
  res.clearCookie('guidia_refresh', { path: '/api' });
  res.status(204).end();
}));

router.get('/me/consents', handler(async (req, res) => {
  ok(res, { consents: await prisma.consentRecord.findMany({ where: { userId: req.user.id }, orderBy: { grantedAt: 'desc' } }) });
}));

const consentSchema = z.object({
  type: z.enum(['VOICE_PROCESSING', 'SCREENSHOT_PROCESSING', 'GUARDIAN_SHARING', 'EXTENSION_CONNECTION', 'TEMPORARY_SUPPORT', 'ANALYTICS']),
  granted: z.boolean(),
  policyVersion: z.string().max(40).default('2026-10'),
});

router.post('/me/consents', handler(async (req, res) => {
  const { type, granted, policyVersion } = parse(consentSchema, req.body);
  if (granted) {
    const record = await prisma.consentRecord.create({ data: { userId: req.user.id, type, policyVersion } });
    ok(res, { consent: record });
  } else {
    await prisma.consentRecord.updateMany({ where: { userId: req.user.id, type, revokedAt: null }, data: { revokedAt: new Date() } });
    ok(res, { revoked: true });
  }
}));

export default router;
