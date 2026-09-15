import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { userRepository } from '../repositories/userRepository.js';
import { ApiError } from '../middleware/errorHandler.js';
import { parseDurationMs } from '../utils/duration.js';

const PASSWORD_MIN_LENGTH = 8;

function isPasswordStrong(password) {
  return (
    password.length >= PASSWORD_MIN_LENGTH &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

function toPublicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    preferredLanguage: user.preferredLanguage,
    ...(user.preference ? { preference: user.preference } : {}),
  };
}

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessTtl,
  });
}

// "Remember me" unchecked → a short-lived session (1 day) instead of the
// full 30-day refresh window, so the browser stops silently re-authenticating
// on a shared/public device soon after the tab is closed.
const SHORT_SESSION_MS = 24 * 60 * 60 * 1000;

async function issueSession(user, userAgent, rememberMe = true) {
  const accessToken = signAccessToken(user);
  const refreshToken = crypto.randomBytes(48).toString('hex');
  const ttlMs = rememberMe ? parseDurationMs(env.jwtRefreshTtl) : SHORT_SESSION_MS;
  const expiresAt = new Date(Date.now() + ttlMs);
  await userRepository.createSession({ userId: user.id, refreshToken, userAgent, expiresAt });
  return { accessToken, refreshToken, refreshTokenMaxAgeMs: ttlMs };
}

export const authService = {
  async register({ fullName, email, password, confirmPassword, preferredLanguage }, userAgent) {
    if (password !== confirmPassword) {
      throw new ApiError(400, 'Those passwords do not match.', 'PASSWORD_MISMATCH');
    }
    if (!isPasswordStrong(password)) {
      throw new ApiError(
        400,
        'Please choose a stronger password (at least 8 characters, with an uppercase letter, a lowercase letter, and a number).',
        'WEAK_PASSWORD'
      );
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ApiError(409, 'An account with this email already exists.', 'EMAIL_TAKEN');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await userRepository.create({
      fullName,
      email,
      passwordHash,
      preferredLanguage: preferredLanguage || 'en',
    });

    const tokens = await issueSession(user, userAgent);
    return { user: toPublicUser(user), ...tokens };
  },

  async login({ email, password, rememberMe }, userAgent) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Incorrect email or password.', 'INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, 'Incorrect email or password.', 'INVALID_CREDENTIALS');
    }

    const tokens = await issueSession(user, userAgent, rememberMe !== false);
    return { user: toPublicUser(user), ...tokens };
  },

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new ApiError(401, 'Your session has expired. Please sign in again.', 'SESSION_EXPIRED');
    }
    const session = await userRepository.findSessionByToken(refreshToken);
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new ApiError(401, 'Your session has expired. Please sign in again.', 'SESSION_EXPIRED');
    }
    const user = await userRepository.findById(session.userId);
    const accessToken = signAccessToken(user);
    return { user: toPublicUser(user), accessToken };
  },

  async logout(refreshToken) {
    if (refreshToken) {
      await userRepository.revokeSession(refreshToken);
    }
  },

  async me(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'Account not found.', 'NOT_FOUND');
    return { ...toPublicUser(user), preference: user.preference };
  },

  // Always succeeds from the caller's point of view, whether or not the
  // email belongs to an account — this is deliberate (README/spec: never
  // reveal whether an email exists). No email provider is configured in
  // this deployment, so the reset link is logged server-side instead of
  // sent — clearly labeled as development-only behavior, never presented
  // to the client as "email sent" when nothing was actually delivered.
  async requestPasswordReset(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) return;

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await userRepository.createPasswordResetToken({ userId: user.id, token, expiresAt });

    const resetUrl = `${env.corsOrigin}/reset-password?token=${token}`;
    // eslint-disable-next-line no-console
    console.log(`[DEV ONLY — no email provider configured] Password reset link for ${email}:\n${resetUrl}`);
  },

  async resetPassword({ token, password, confirmPassword }) {
    if (password !== confirmPassword) {
      throw new ApiError(400, 'Those passwords do not match.', 'PASSWORD_MISMATCH');
    }
    if (!isPasswordStrong(password)) {
      throw new ApiError(
        400,
        'Please choose a stronger password (at least 8 characters, with an uppercase letter, a lowercase letter, and a number).',
        'WEAK_PASSWORD'
      );
    }

    const record = await userRepository.findPasswordResetToken(token);
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new ApiError(400, 'That reset link is invalid or has expired. Please request a new one.', 'INVALID_RESET_TOKEN');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await userRepository.consumePasswordResetToken(record.id, record.userId, passwordHash);
  },
};
