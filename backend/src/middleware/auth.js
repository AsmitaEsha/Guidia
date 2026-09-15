import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from './errorHandler.js';

// Verifies the access token sent as `Authorization: Bearer <token>` and
// attaches { id, role } to req.user. Used to protect every non-public route.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'You need to be signed in to do that.', 'UNAUTHORIZED'));
  }

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new ApiError(401, 'Your session has expired. Please sign in again.', 'SESSION_EXPIRED'));
  }
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
