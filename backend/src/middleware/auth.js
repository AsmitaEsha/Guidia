import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { ApiError } from './errorHandler.js';
import { hashToken } from '../security/tokens.js';

function bearer(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

// Verifies the access JWT (`Authorization: Bearer <jwt>`) and attaches
// { id, role } to req.user.
export function requireAuth(req, res, next) {
  const token = bearer(req);
  if (!token) {
    return next(new ApiError(401, 'You need to be signed in to do that.', 'UNAUTHORIZED'));
  }
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret);
    if (payload.typ && payload.typ !== 'access') throw new Error('wrong token type');
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new ApiError(401, 'Your session has expired. Please sign in again.', 'SESSION_EXPIRED'));
  }
}

// Attaches req.user when a valid access token is present; otherwise
// continues anonymously (for features that also work before sign-in).
export function optionalAuth(req, res, next) {
  const token = bearer(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret);
    if (!payload.typ || payload.typ === 'access') req.user = { id: payload.sub, role: payload.role };
  } catch { /* expired or invalid: treat as signed out */ }
  next();
}

// Restricts a route to one or more roles, e.g. requireRole('ADMIN').
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "You don't have access to that.", 'FORBIDDEN'));
    }
    next();
  };
}

// Accepts either a normal user session or a scoped browser-extension token
// carrying `scope`. Extension tokens are opaque (hashed in the DB) and can
// only reach routes that opt in with this middleware.
export function requireUserOrExtension(scope) {
  return async (req, res, next) => {
    const token = bearer(req);
    if (!token) return next(new ApiError(401, 'You need to be signed in to do that.', 'UNAUTHORIZED'));

    if (token.startsWith('gx_')) {
      try {
        const record = await prisma.extensionToken.findUnique({ where: { tokenHash: hashToken(token) } });
        if (!record || record.revokedAt || record.expiresAt < new Date() || !record.scopes.includes(scope)) {
          return next(new ApiError(401, 'Please reconnect the Guidia extension.', 'EXTENSION_TOKEN_INVALID'));
        }
        const user = await prisma.user.findUnique({ where: { id: record.userId }, select: { id: true, role: true } });
        if (!user) return next(new ApiError(401, 'Please reconnect the Guidia extension.', 'EXTENSION_TOKEN_INVALID'));
        prisma.extensionToken.update({ where: { id: record.id }, data: { lastUsedAt: new Date() } }).catch(() => {});
        req.user = { id: user.id, role: user.role, via: 'extension' };
        return next();
      } catch (err) {
        return next(err);
      }
    }
    return requireAuth(req, res, next);
  };
}
