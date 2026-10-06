import { redactObject } from '../security/sensitiveDataGuard.js';

// Minimal structured logger: one JSON object per line in production, a
// readable line in development. Every payload passes through redactObject,
// so passwords/tokens/OTPs never reach log storage even if a caller slips.

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
const minLevel = LEVELS[process.env.LOG_LEVEL] ?? (isProd ? LEVELS.info : LEVELS.debug);

function serializeError(err) {
  if (!(err instanceof Error)) return err;
  return { name: err.name, message: err.message, code: err.code, ...(isProd ? {} : { stack: err.stack }) };
}

function write(level, msg, fields = {}) {
  if (isTest || LEVELS[level] < minLevel) return;
  const safe = redactObject({ ...fields, ...(fields.err ? { err: serializeError(fields.err) } : {}) });
  if (isProd) {
    const line = JSON.stringify({ ts: new Date().toISOString(), level, msg, ...safe });
    (level === 'error' ? process.stderr : process.stdout).write(`${line}\n`);
    return;
  }
  const extra = Object.keys(safe).length ? ` ${JSON.stringify(safe)}` : '';
  // eslint-disable-next-line no-console
  (level === 'error' ? console.error : console.log)(`[${level}] ${msg}${extra}`);
}

export const logger = {
  debug: (msg, fields) => write('debug', msg, fields),
  info: (msg, fields) => write('info', msg, fields),
  warn: (msg, fields) => write('warn', msg, fields),
  error: (msg, fields) => write('error', msg, fields),
};
