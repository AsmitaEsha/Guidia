import { logger } from '../lib/logger.js';

// Central error handler. Every route forwards errors here via next(err) so
// technical details never leak into a client response: seniors see
// human-friendly messages, developers get full detail in the server log.
//
// Response shape: { success: false, error: { code, message, requestId } }

export class ApiError extends Error {
  constructor(status, message, code, details) {
    super(message);
    this.status = status;
    this.code = code || 'ERROR';
    if (details) this.details = details;
  }
}

export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'That was not found.', requestId: req.id } });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const isApiError = err instanceof ApiError;
  const status = isApiError ? err.status : 500;
  const code = isApiError ? err.code : 'INTERNAL_ERROR';

  if (status >= 500) {
    logger.error('unhandled error', { requestId: req.id, code, err });
  }

  // An ApiError's message was written to be shown to the user, even at a
  // 5xx status (e.g. "AI isn't configured yet" is a 503 but not a secret).
  // Only a truly unexpected error gets the generic message.
  const message = isApiError ? err.message : "Something didn't work on our side. Please try again.";

  res.status(status).json({
    success: false,
    error: { code, message, ...(req.id ? { requestId: req.id } : {}), ...(isApiError && err.details ? { details: err.details } : {}) },
  });
}
