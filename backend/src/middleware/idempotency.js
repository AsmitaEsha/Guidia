import { prisma } from '../config/prisma.js';
import { ApiError } from './errorHandler.js';
import { stableHash } from '../security/tokens.js';

const TTL_MS = 24 * 60 * 60 * 1000;
const KEY_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

// Makes a POST safe to retry: the same Idempotency-Key from the same user on
// the same route replays the stored response instead of repeating the side
// effect (double-tapped "Confirm", flaky network retries, duplicate SOS).
//
// `required` forces clients to send a key on routes where a duplicate would
// be harmful (sensitive action confirmation, approvals, emergencies).
export function idempotent({ required = false } = {}) {
  return async (req, res, next) => {
    const key = req.headers['idempotency-key'];
    if (!key) {
      if (required) return next(new ApiError(400, 'This request needs an Idempotency-Key header.', 'IDEMPOTENCY_KEY_REQUIRED'));
      return next();
    }
    if (typeof key !== 'string' || !KEY_PATTERN.test(key)) {
      return next(new ApiError(400, 'Invalid Idempotency-Key header.', 'IDEMPOTENCY_KEY_INVALID'));
    }
    if (!req.user?.id) return next();

    const route = `${req.method} ${req.baseUrl}${req.route?.path ?? req.path}`;
    const requestHash = stableHash({ params: req.params, body: req.body });
    const where = { userId_key_route: { userId: req.user.id, key, route } };

    try {
      const existing = await prisma.idempotencyKey.findUnique({ where });
      if (existing && existing.expiresAt > new Date()) {
        if (existing.requestHash !== requestHash) {
          return next(new ApiError(409, 'This request key was already used for a different request.', 'IDEMPOTENCY_KEY_REUSED'));
        }
        res.setHeader('Idempotent-Replay', 'true');
        return res.status(existing.responseStatus).json(existing.responseBody);
      }
    } catch (err) {
      return next(err);
    }

    // Capture the response body so it can be replayed. Only 2xx responses
    // are stored; failures may legitimately be retried.
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        prisma.idempotencyKey
          .upsert({
            where,
            create: { userId: req.user.id, key, route, requestHash, responseStatus: res.statusCode, responseBody: body, expiresAt: new Date(Date.now() + TTL_MS) },
            update: { requestHash, responseStatus: res.statusCode, responseBody: body, expiresAt: new Date(Date.now() + TTL_MS) },
          })
          .catch(() => {});
      }
      return originalJson(body);
    };
    next();
  };
}
