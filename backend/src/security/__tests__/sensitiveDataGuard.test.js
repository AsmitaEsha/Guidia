import test from 'node:test';
import assert from 'node:assert/strict';
import { redactSensitive, containsSensitive, redactObject } from '../sensitiveDataGuard.js';

test('redacts an OTP stated in English', () => {
  const { text, redactions } = redactSensitive('My OTP is 583921, what now?');
  assert.equal(text, 'My OTP is [REDACTED_OTP], what now?');
  assert.equal(redactions.OTP, 1);
});

test('redacts an OTP in Bengali with Bengali digits', () => {
  const { text } = redactSensitive('আমার ওটিপি ৫৮৩৯২১');
  assert.match(text, /\[REDACTED_OTP\]/);
  assert.doesNotMatch(text, /৫৮৩৯২১/);
});

test('redacts a bKash PIN', () => {
  const { text } = redactSensitive('my bkash pin: 12345');
  assert.equal(text, 'my bkash pin: [REDACTED_PIN]');
});

test('redacts a password value', () => {
  const { text } = redactSensitive('the password is Hunter2!x');
  assert.equal(text, 'the password is [REDACTED_PASSWORD]');
});

test('redacts a Luhn-valid card number but not a phone number', () => {
  const { text } = redactSensitive('card 4111 1111 1111 1111 and call 01712345678');
  assert.match(text, /\[REDACTED_CARD\]/);
  assert.match(text, /01712345678/);
});

test('redacts CVV and bank account numbers', () => {
  const { text } = redactSensitive('CVV 123, account number 0012-3456-7890');
  assert.match(text, /CVV \[REDACTED_CVV\]/);
  assert.match(text, /\[REDACTED_ACCOUNT\]/);
});

test('redacts NID and Aadhaar numbers', () => {
  assert.match(redactSensitive('NID 1990123456789').text, /\[REDACTED_NID\]/);
  assert.match(redactSensitive('aadhaar 1234 5678 9012').text, /\[REDACTED_NID\]/);
});

test('redacts API keys, JWTs and bearer tokens', () => {
  const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
  const { text, count } = redactSensitive(`key xai-abcdefghijklmnop1234 and ${jwt} and Bearer abcdefghijklmnopqrstu`);
  assert.equal(count, 3);
  assert.doesNotMatch(text, /xai-abcdef|eyJhbG|abcdefghijklmnopqrstu/);
});

test('leaves ordinary safety advice untouched', () => {
  const input = 'Never share your OTP or PIN with anyone. Send 500 taka to Rahim.';
  assert.equal(redactSensitive(input).text, input);
  assert.equal(containsSensitive(input), false);
});

test('redactObject masks sensitive keys and nested strings', () => {
  const out = redactObject({ password: 'x', nested: { note: 'OTP is 112233' }, ok: 1 });
  assert.equal(out.password, '[REDACTED]');
  assert.equal(out.nested.note, 'OTP is [REDACTED_OTP]');
  assert.equal(out.ok, 1);
});
