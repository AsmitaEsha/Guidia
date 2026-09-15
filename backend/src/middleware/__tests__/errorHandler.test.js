import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, errorHandler } from '../errorHandler.js';

// Regression test for a real bug found and fixed during development: the
// handler used to overwrite every ApiError's message with a generic string
// whenever status >= 500, which silently swallowed intentionally-crafted
// messages like "AI isn't configured yet" (a 503, but not a secret).

function mockRes() {
  const res = { statusCode: null, body: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
}

test('a 5xx ApiError keeps its own message, not the generic fallback', () => {
  const err = new ApiError(503, "AI isn't set up yet.", 'AI_NOT_CONFIGURED');
  const res = mockRes();
  errorHandler(err, {}, res, () => {});
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.error.message, "AI isn't set up yet.");
  assert.equal(res.body.error.code, 'AI_NOT_CONFIGURED');
});

test('a 4xx ApiError keeps its own message', () => {
  const err = new ApiError(400, 'Please enter a valid email address.', 'VALIDATION_ERROR');
  const res = mockRes();
  errorHandler(err, {}, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error.message, 'Please enter a valid email address.');
});

test('a raw, un-thrown exception gets the generic message, not its own (possibly sensitive) text', () => {
  const err = new Error('ECONNREFUSED 127.0.0.1:5432 — connection string: postgres://user:pw@host');
  const res = mockRes();
  errorHandler(err, {}, res, () => {});
  assert.equal(res.statusCode, 500);
  assert.equal(res.body.error.code, 'INTERNAL_ERROR');
  assert.doesNotMatch(res.body.error.message, /ECONNREFUSED|postgres:\/\//);
});
