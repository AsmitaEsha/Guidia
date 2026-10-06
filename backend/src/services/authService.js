import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { userRepository } from '../repositories/userRepository.js';
import { ApiError } from '../middleware/errorHandler.js';
import { parseDurationMs } from '../utils/duration.js';
import { hashToken, randomToken } from '../security/tokens.js';
import { audit, AUDIT } from './auditService.js';
import { outbox } from '../notifications/outbox.js';
import { logger } from '../lib/logger.js';

const PASSWORD_MIN_LENGTH = 8;
const RESET_TTL_MS = 30 * 60 * 1000;
// "Remember me" unchecked → a 1-day session instead of the full window.
const SHORT_SESSION_MS = 24 * 60 * 60 * 1000;
// A rotated-out token presented again within this window is treated as a
// benign race (two tabs refreshing at once), not theft.
const ROTATION_GRACE_MS = 10 * 1000;

const WEAK_PASSWORD_MESSAGE = 'Please choose a stronger password (at least 8 characters, with an uppercase letter, a lowercase letter, and a number).';
const SESSION_EXPIRED = () => new ApiError(401, 'Your session has expired. Please sign in again.', 'SESSION_EXPIRED');

// A constant bcrypt hash compared against when the email doesn't exist, so
// login timing doesn't reveal which emails have accounts.
const DUMMY_HASH = bcrypt.hashSync('guidia-timing-equaliser', 12);

function isPasswordStrong(password) {
  return password.length >= PASSWORD_MIN_LENGTH && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

export function toPublicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    preferredLanguage: user.preferredLanguage,
    age: user.age ?? null,
    countryCode: user.countryCode ?? null,
    preference: user.preference ?? null,
  };
}

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, typ: 'access' }, env.jwtAccessSecret, { expiresIn: env.jwtAccessTtl });
}

async function issueSession(user, { userAgent, rememberMe = true, familyId, tx = prisma } = {}) {
  const refreshToken = randomToken(48);
  const ttlMs = rememberMe ? parseDurationMs(env.jwtRefreshTtl) : SHORT_SESSION_MS;
  const session = await userRepository.createSession({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    familyId: familyId || crypto.randomUUID(),
    userAgent: userAgent?.slice(0, 300),
    expiresAt: new Date(Date.now() + ttlMs),
  }, tx);
  return { accessToken: signAccessToken(user), refreshToken, refreshTokenMaxAgeMs: ttlMs, session };
}

export const authService = {
  async register({ fullName, email, password, confirmPassword, preferredLanguage }, { userAgent, requestId } = {}) {
    if (password !== confirmPassword) throw new ApiError(400, 'Those passwords do not match.', 'PASSWORD_MISMATCH');
    if (!isPasswordStrong(password)) throw new ApiError(400, WEAK_PASSWORD_MESSAGE, 'WEAK_PASSWORD');

    if (await userRepository.findByEmail(email)) {
      throw new ApiError(409, 'An account with this email already exists.', 'EMAIL_TAKEN');
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await userRepository.create({ fullName, email, passwordHash, preferredLanguage: preferredLanguage || 'en' });
    const tokens = await issueSession(user, { userAgent });
    await audit({ actorUserId: user.id, action: AUDIT.REGISTERED, targetType: 'User', targetId: user.id, requestId });
    return { user: toPublicUser(user), ...tokens };
  },

  async login({ email, password, rememberMe }, { userAgent, requestId } = {}) {
    const user = await userRepository.findByEmail(email);
    const valid = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH);
    if (!user || !valid) {
      await audit({ actorUserId: user?.id ?? null, action: AUDIT.LOGIN_FAILURE, requestId, metadata: { reason: user ? 'bad_password' : 'unknown_email' } });
      throw new ApiError(401, 'Incorrect email or password.', 'INVALID_CREDENTIALS');
    }
    const tokens = await issueSession(user, { userAgent, rememberMe: rememberMe !== false });
    await audit({ actorUserId: user.id, action: AUDIT.LOGIN_SUCCESS, targetType: 'Session', targetId: tokens.session.id, requestId });
    return { user: toPublicUser(user), ...tokens };
  },

  // Rotates the refresh token: the presented token is revoked and replaced.
  // Re-use of an already-rotated token (outside a short grace window) means
  // it was stolen, so the whole session family is revoked.
  async refresh(refreshToken, { userAgent, requestId } = {}) {
    if (!refreshToken) throw SESSION_EXPIRED();
    const session = await userRepository.findSessionByHash(hashToken(refreshToken));
    if (!session) throw SESSION_EXPIRED();

    if (session.revokedAt) {
      const recentlyRotated = session.revokeReason === 'rotated' && Date.now() - session.revokedAt.getTime() < ROTATION_GRACE_MS;
      if (!recentlyRotated) {
        await userRepository.revokeFamily(session.familyId, 'reuse_detected');
        await audit({ actorUserId: session.userId, actorType: 'SYSTEM', action: AUDIT.SESSION_REUSE_DETECTED, targetType: 'Session', targetId: session.id, requestId });
        logger.warn('refresh token reuse detected', { userId: session.userId, familyId: session.familyId });
      }
      throw SESSION_EXPIRED();
    }
    if (session.expiresAt < new Date()) throw SESSION_EXPIRED();

    const user = await userRepository.findById(session.userId);
    if (!user) throw SESSION_EXPIRED();

    const remainingMs = session.expiresAt.getTime() - Date.now();
    const result = await prisma.$transaction(async (tx) => {
      // Conditional revoke: only one concurrent refresh can win the rotation.
      const { count } = await tx.session.updateMany({
        where: { id: session.id, revokedAt: null },
        data: { revokedAt: new Date(), revokeReason: 'rotated' },
      });
      if (count !== 1) return null;
      const next = await issueSession(user, { userAgent, familyId: session.familyId, tx });
      // Keep the family's absolute expiry rather than extending it forever.
      await tx.session.update({ where: { id: next.session.id }, data: { expiresAt: session.expiresAt } });
      await tx.session.update({ where: { id: session.id }, data: { replacedById: next.session.id } });
      return { ...next, refreshTokenMaxAgeMs: remainingMs };
    });
    if (!result) throw SESSION_EXPIRED();
    return { user: toPublicUser(user), ...result };
  },

  async logout(refreshToken, { requestId } = {}) {
    if (!refreshToken) return;
    const session = await userRepository.findSessionByHash(hashToken(refreshToken));
    if (!session) return;
    await userRepository.revokeFamily(session.familyId, 'logout');
    await audit({ actorUserId: session.userId, action: AUDIT.LOGOUT, targetType: 'Session', targetId: session.id, requestId });
  },

  async me(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'Account not found.', 'NOT_FOUND');
    return toPublicUser(user);
  },

  // Always looks the same to the caller whether or not the email exists.
  async requestPasswordReset(email, { requestId } = {}) {
    const user = await userRepository.findByEmail(email);
    if (!user) return;

    const token = randomToken(32);
    await userRepository.createPasswordResetToken({ userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + RESET_TTL_MS) });
    const resetUrl = `${env.appUrl}/reset-password?token=${encodeURIComponent(token)}`;

    await outbox.enqueueEmail({
      to: user.email,
      template: 'password_reset',
      data: { fullName: user.fullName, resetUrl, language: user.preferredLanguage },
      idempotencyKey: `password_reset:${hashToken(token)}`,
    });
    await audit({ actorUserId: user.id, action: AUDIT.PASSWORD_RESET_REQUESTED, targetType: 'User', targetId: user.id, requestId });

    if (env.nodeEnv === 'development') {
      // Development convenience only — never runs in production or test.
      // eslint-disable-next-line no-console
      console.log(`[DEV ONLY] Password reset link for ${user.email}:\n${resetUrl}`);
    }
  },

  async resetPassword({ token, password, confirmPassword }, { requestId } = {}) {
    if (password !== confirmPassword) throw new ApiError(400, 'Those passwords do not match.', 'PASSWORD_MISMATCH');
    if (!isPasswordStrong(password)) throw new ApiError(400, WEAK_PASSWORD_MESSAGE, 'WEAK_PASSWORD');

    const invalid = () => new ApiError(400, 'That reset link is invalid or has expired. Please request a new one.', 'INVALID_RESET_TOKEN');
    const record = await userRepository.findPasswordResetToken(hashToken(token));
    if (!record || record.usedAt || record.expiresAt < new Date()) throw invalid();

    const passwordHash = await bcrypt.hash(password, 12);
    const consumed = await userRepository.consumePasswordResetToken(record.id, record.userId, passwordHash);
    if (!consumed) throw invalid();
    await audit({ actorUserId: record.userId, action: AUDIT.PASSWORD_RESET, targetType: 'User', targetId: record.userId, requestId });
  },

  listSessions(userId) {
    return userRepository.listActiveSessions(userId);
  },

  async revokeSession(userId, sessionId, { requestId } = {}) {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) throw new ApiError(404, 'That session was not found.', 'NOT_FOUND');
    await userRepository.revokeFamily(session.familyId, 'user_revoked');
    await audit({ actorUserId: userId, action: AUDIT.SESSION_REVOKED, targetType: 'Session', targetId: sessionId, requestId });
  },
};
