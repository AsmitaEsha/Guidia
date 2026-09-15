import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDurationMs } from '../duration.js';

test('parses seconds/minutes/hours/days correctly', () => {
  assert.equal(parseDurationMs('30s'), 30_000);
  assert.equal(parseDurationMs('15m'), 15 * 60_000);
  assert.equal(parseDurationMs('2h'), 2 * 3_600_000);
  assert.equal(parseDurationMs('30d'), 30 * 86_400_000);
});

test('throws on an invalid format', () => {
  assert.throws(() => parseDurationMs('banana'));
  assert.throws(() => parseDurationMs('10'));
  assert.throws(() => parseDurationMs('10x'));
});
