import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

function limiter({ windowMs, limit, message, perUser = false }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    // Expensive AI routes are limited per account (shared IPs at senior
    // centres shouldn't throttle everyone); unauthenticated routes per IP.
    keyGenerator: (req) => (perUser && req.user?.id ? `u:${req.user.id}` : ipKeyGenerator(req.ip)),
    skip: () => process.env.NODE_ENV === 'test',
    message: { success: false, error: { code: 'RATE_LIMITED', message } },
  });
}

// Development (and live demos run from a laptop) get far more sign-in
// attempts; production keeps the strict limit.
const DEV = process.env.NODE_ENV !== 'production';

export const limits = {
  auth: limiter({ windowMs: 15 * 60_000, limit: DEV ? 300 : 20, message: 'Too many attempts. Please wait a few minutes and try again.' }),
  passwordReset: limiter({ windowMs: 60 * 60_000, limit: DEV ? 50 : 5, message: 'Too many reset requests. Please try again later.' }),
  assistant: limiter({ windowMs: 60_000, limit: 20, perUser: true, message: 'Please slow down a little before asking again.' }),
  vision: limiter({ windowMs: 60_000, limit: 10, perUser: true, message: 'Please wait a moment before analysing another screenshot.' }),
  voice: limiter({ windowMs: 60_000, limit: 60, perUser: true, message: 'Please wait a moment before requesting more voice playback.' }),
  safety: limiter({ windowMs: 60_000, limit: 30, perUser: true, message: 'Please slow down a little before checking again.' }),
  guardian: limiter({ windowMs: 60_000, limit: 30, perUser: true, message: 'Please wait a moment and try again.' }),
  // Emergencies are never blocked for long — but a stuck button can't flood guardians.
  emergency: limiter({ windowMs: 60_000, limit: 10, perUser: true, message: 'Your help request is already on its way.' }),
  extension: limiter({ windowMs: 60_000, limit: 20, perUser: true, message: 'Please wait a moment before capturing again.' }),
};
