import crypto from 'node:crypto';
import { logger } from '../lib/logger.js';

const ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

// Gives every request a correlation id (honouring a well-formed incoming
// X-Request-Id) and logs one line per request with route, status and
// duration — never bodies, query strings or headers.
export function requestContext(req, res, next) {
  const incoming = req.headers['x-request-id'];
  req.id = typeof incoming === 'string' && ID_PATTERN.test(incoming) ? incoming : crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);

  const started = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number((process.hrtime.bigint() - started) / 1_000_000n);
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level]('request', {
      requestId: req.id,
      method: req.method,
      route: req.baseUrl + (req.route?.path || ''),
      status: res.statusCode,
      durationMs,
      userId: req.user?.id,
    });
  });
  next();
}
