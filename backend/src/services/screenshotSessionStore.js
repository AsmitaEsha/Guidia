import crypto from 'crypto';

const RETENTION_MS = 30 * 60 * 1000;
const sessions = new Map();

function cleanExpired() {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (session.expiresAt <= now) {
      sessions.delete(id);
    }
  }
}

export const screenshotSessionStore = {
  create({ imageBuffer, mimeType, analysis, sourceUrl }) {
    cleanExpired();
    const id = crypto.randomUUID();
    const now = Date.now();
    sessions.set(id, {
      id,
      imageBase64: imageBuffer.toString('base64'),
      mimeType,
      analysis,
      sourceUrl: sourceUrl || '',
      createdAt: new Date(now).toISOString(),
      expiresAt: now + RETENTION_MS,
    });
    return sessions.get(id);
  },

  get(id) {
    cleanExpired();
    return sessions.get(id) || null;
  },

  remove(id) {
    sessions.delete(id);
  },
};
