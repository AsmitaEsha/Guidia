import crypto from 'node:crypto';

// Opaque bearer secrets (refresh, reset, extension, pairing) are random
// bytes handed to the client once; only their SHA-256 lives in the DB, so a
// database read never yields a usable token. SHA-256 (not bcrypt) is right
// here: the inputs are 256+ bits of entropy, not guessable passwords.

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

// Short human-typable code for extension pairing (no 0/O/1/I).
export function pairingCode(length = 8) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i += 1) code += alphabet[bytes[i] % alphabet.length];
  return code;
}

export function stableHash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value ?? null)).digest('hex');
}
