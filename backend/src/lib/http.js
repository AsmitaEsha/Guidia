import { ApiError } from '../middleware/errorHandler.js';

// Success envelope: { success: true, data }.
export function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function created(res, data) {
  return ok(res, data, 201);
}

// Validates with a zod schema and throws a user-readable 400.
export function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ApiError(400, result.error.issues[0]?.message || 'Invalid request.', 'VALIDATION_ERROR');
  }
  return result.data;
}

// Wraps an async handler so thrown errors reach the error middleware.
export function handler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
