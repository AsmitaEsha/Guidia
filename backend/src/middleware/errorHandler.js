// Central error handler. Every route forwards errors here via next(err)
// so technical details never leak straight into a client-facing response —
// per the product's rule that seniors should see human-friendly messages
// while developers still get full detail in the server log.

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code || 'ERROR';
  }
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'That was not found.' } });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const isApiError = err instanceof ApiError;
  const status = isApiError ? err.status : 500;
  const code = isApiError ? err.code : 'INTERNAL_ERROR';

  if (status >= 500) {
    console.error(err);
  }

  // An ApiError's message was already written to be shown to the user,
  // even at a 5xx status (e.g. "AI isn't configured yet" is a 503 but is
  // not a secret). Only a truly unexpected, un-thrown error gets the
  // generic message, so we never leak a raw exception/stack trace.
  const message = isApiError
    ? err.message
    : "Something didn't work on our side. Please try again.";

  res.status(status).json({ error: { code, message } });
}
