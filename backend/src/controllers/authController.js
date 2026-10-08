import { z } from 'zod';
import { authService } from '../services/authService.js';
import { env } from '../config/env.js';
import { ok, created, parse } from '../lib/http.js';
import { LANGUAGE_CODES } from '../config/languages.js';

const REFRESH_COOKIE = 'guidia_refresh';
const COOKIE_PATH = '/api';

function cookieOptions(maxAgeMs) {
  return {
    httpOnly: true,
    secure: env.isProduction || env.cookieSameSite === 'none',
    sameSite: env.cookieSameSite,
    path: COOKIE_PATH,
    ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
  };
}

function setRefreshCookie(res, token, maxAgeMs) {
  res.cookie(REFRESH_COOKIE, token, cookieOptions(maxAgeMs));
}

const languageEnum = z.enum(LANGUAGE_CODES);
const email = z.string().trim().toLowerCase().email('Please enter a valid email address.');

const registerSchema = z.object({
  fullName: z.string().trim().min(1, 'Please enter your full name.').max(120),
  email,
  password: z.string().max(200),
  confirmPassword: z.string().max(200),
  preferredLanguage: languageEnum.optional(),
  // LEARNER: learns with Guidia. FAMILY: a son, daughter or carer who
  // follows a learner's progress and answers their help requests.
  accountType: z.enum(['LEARNER', 'FAMILY']).optional(),
  // FAMILY only: the code a learner shared, to connect straight away.
  familyCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{4,12}$/, 'That family code does not look right.').optional().or(z.literal('')),
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Please enter your password.').max(200),
  rememberMe: z.boolean().optional(),
});

const forgotPasswordSchema = z.object({ email });

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'That reset link is invalid.').max(200),
  password: z.string().max(200),
  confirmPassword: z.string().max(200),
});

const ctx = (req) => ({ userAgent: req.headers['user-agent'], requestId: req.id });

export const authController = {
  async register(req, res) {
    const data = parse(registerSchema, req.body);
    const { user, accessToken, refreshToken, refreshTokenMaxAgeMs } = await authService.register(data, ctx(req));
    setRefreshCookie(res, refreshToken, refreshTokenMaxAgeMs);
    created(res, { user, accessToken });
  },

  async login(req, res) {
    const data = parse(loginSchema, req.body);
    const { user, accessToken, refreshToken, refreshTokenMaxAgeMs } = await authService.login(data, ctx(req));
    setRefreshCookie(res, refreshToken, refreshTokenMaxAgeMs);
    ok(res, { user, accessToken });
  },

  async refresh(req, res) {
    const { user, accessToken, refreshToken, refreshTokenMaxAgeMs } = await authService.refresh(req.cookies?.[REFRESH_COOKIE], ctx(req));
    setRefreshCookie(res, refreshToken, refreshTokenMaxAgeMs);
    ok(res, { user, accessToken });
  },

  async logout(req, res) {
    await authService.logout(req.cookies?.[REFRESH_COOKIE], ctx(req));
    res.clearCookie(REFRESH_COOKIE, cookieOptions());
    res.status(204).end();
  },

  async me(req, res) {
    ok(res, { user: await authService.me(req.user.id) });
  },

  async forgotPassword(req, res) {
    const { email: address } = parse(forgotPasswordSchema, req.body);
    await authService.requestPasswordReset(address, ctx(req));
    ok(res, { message: "If an account exists for that email, we've sent a password reset link." });
  },

  async resetPassword(req, res) {
    const data = parse(resetPasswordSchema, req.body);
    await authService.resetPassword(data, ctx(req));
    ok(res, { message: 'Your password has been reset. Please sign in with your new password.' });
  },

  async sessions(req, res) {
    ok(res, { sessions: await authService.listSessions(req.user.id) });
  },

  async revokeSession(req, res) {
    await authService.revokeSession(req.user.id, req.params.id, ctx(req));
    res.status(204).end();
  },
};
