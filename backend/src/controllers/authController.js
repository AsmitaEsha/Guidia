import { z } from 'zod';
import { authService } from '../services/authService.js';
import { ApiError } from '../middleware/errorHandler.js';

const REFRESH_COOKIE = 'guidia_refresh';
const isProd = process.env.NODE_ENV === 'production';

function setRefreshCookie(res, token, maxAgeMs) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: maxAgeMs ?? 1000 * 60 * 60 * 24 * 30,
    path: '/api/auth',
  });
}

const registerSchema = z.object({
  fullName: z.string().trim().min(1, 'Please enter your full name.'),
  email: z.string().trim().email('Please enter a valid email address.'),
  password: z.string(),
  confirmPassword: z.string(),
  preferredLanguage: z.enum(['en', 'bn', 'hi']).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Please enter your password.'),
  rememberMe: z.boolean().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'That reset link is invalid.'),
  password: z.string(),
  confirmPassword: z.string(),
});

function parseBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.issues[0]?.message || 'Invalid request.', 'VALIDATION_ERROR');
  }
  return result.data;
}

export const authController = {
  async register(req, res, next) {
    try {
      const data = parseBody(registerSchema, req.body);
      const { user, accessToken, refreshToken, refreshTokenMaxAgeMs } = await authService.register(data, req.headers['user-agent']);
      setRefreshCookie(res, refreshToken, refreshTokenMaxAgeMs);
      res.status(201).json({ user, accessToken });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const data = parseBody(loginSchema, req.body);
      const { user, accessToken, refreshToken, refreshTokenMaxAgeMs } = await authService.login(data, req.headers['user-agent']);
      setRefreshCookie(res, refreshToken, refreshTokenMaxAgeMs);
      res.json({ user, accessToken });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req, res, next) {
    try {
      const token = req.cookies?.[REFRESH_COOKIE];
      const { user, accessToken } = await authService.refresh(token);
      res.json({ user, accessToken });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      const token = req.cookies?.[REFRESH_COOKIE];
      await authService.logout(token);
      res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      const user = await authService.me(req.user.id);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },

  // Always returns the same generic response whether or not the email
  // belongs to an account — never reveals account existence.
  async forgotPassword(req, res, next) {
    try {
      const { email } = parseBody(forgotPasswordSchema, req.body);
      await authService.requestPasswordReset(email);
      res.json({ message: "If an account exists for that email, we've started a password reset." });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const data = parseBody(resetPasswordSchema, req.body);
      await authService.resetPassword(data);
      res.json({ message: 'Your password has been reset. Please sign in with your new password.' });
    } catch (err) {
      next(err);
    }
  },
};
