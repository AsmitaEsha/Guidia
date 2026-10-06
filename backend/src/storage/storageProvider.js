import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

// Temporary media storage. Raw screenshots live here only until their
// ScreenshotAnalysis row expires (the worker deletes them). Keys are random
// and never derived from user input.
//
// LocalEphemeralProvider writes to the OS temp dir — fine for one instance.
// Multi-instance deployments should add an S3-compatible provider with
// private objects and short-lived signed URLs behind this same interface.

const ROOT = process.env.STORAGE_DIR || path.join(os.tmpdir(), 'guidia-media');
const KEY_PATTERN = /^[a-z]+\/[a-f0-9]{32}\.(png|jpg|webp)$/;

function resolve(key) {
  if (!KEY_PATTERN.test(key)) throw new Error('Invalid storage key');
  return path.join(ROOT, key);
}

const localEphemeralProvider = {
  name: 'local-ephemeral',

  async put(prefix, buffer, ext) {
    const key = `${prefix}/${crypto.randomBytes(16).toString('hex')}.${ext}`;
    const file = resolve(key);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, buffer, { mode: 0o600 });
    return key;
  },

  async get(key) {
    return fs.readFile(resolve(key));
  },

  async remove(key) {
    await fs.rm(resolve(key), { force: true });
  },
};

export const storage = localEphemeralProvider;
