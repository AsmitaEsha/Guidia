import { env } from '../config/env.js';
import { ApiError } from './errorHandler.js';

// In development any port on this machine is trusted, so the app keeps
// working when Vite picks another port (5174, 4173 for `vite preview`) or the
// page is opened as 127.0.0.1. Production only trusts CORS_ORIGIN.
const LOOPBACK = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

export function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (env.corsOrigins.includes(origin)) return true;
  if (!env.isProduction && LOOPBACK.test(origin)) return true;
  const ext = /^(?:chrome|edge)-extension:\/\/([a-p]{32})$/.exec(origin);
  return Boolean(ext && env.allowedExtensionIds.includes(ext[1]));
}

// CSRF defence for routes authenticated by the refresh cookie (refresh,
// logout). CORS alone doesn't stop a cross-site form POST from carrying the
// cookie, so state-changing cookie routes require an allowed Origin header.
// When this server also serves the web app (demo mode, one public address
// such as a tunnel URL), a page from that same address is trusted too.
function isSameOrigin(req, origin) {
  if (!env.serveWeb || !origin) return false;
  let host;
  try { host = new URL(origin).host; } catch { return false; }
  return [req.get('host'), req.get('x-forwarded-host')].filter(Boolean).some((h) => h.split(',')[0].trim() === host);
}

export function requireAllowedOrigin(req, res, next) {
  const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null);
  if (!origin && !env.isProduction) return next(); // curl / server-to-server in dev
  if (isAllowedOrigin(origin) || isSameOrigin(req, origin)) return next();
  next(new ApiError(403, 'This request came from a page Guidia does not trust.', 'ORIGIN_NOT_ALLOWED'));
}
