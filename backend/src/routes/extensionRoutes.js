import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { limits } from '../middleware/rateLimits.js';
import { ApiError } from '../middleware/errorHandler.js';
import { handler, ok, created, parse } from '../lib/http.js';
import { hashToken, pairingCode, randomToken } from '../security/tokens.js';
import { audit, AUDIT } from '../services/auditService.js';

// Browser-extension pairing:
//   1. Signed-in user clicks "Connect extension" → POST /pairing → 8-char code (10 min).
//   2. User types the code into the extension → POST /exchange → scoped token
//      (prefix gx_, 30 days, SCREENSHOT_CAPTURE only), kept in chrome.storage.session.
//   3. Extension calls POST /vision/sessions with that token.
// The extension never receives the user's session or refresh cookie.

const router = Router();
const PAIRING_TTL_MS = 10 * 60_000;
const TOKEN_TTL_MS = 30 * 24 * 60 * 60_000;
const SCOPES = ['SCREENSHOT_CAPTURE'];

function ensureEnabled() {
  if (!env.features.browserExtension) throw new ApiError(503, 'The Guidia browser extension is turned off.', 'EXTENSION_DISABLED');
}

router.post('/pairing', requireAuth, limits.extension, handler(async (req, res) => {
  ensureEnabled();
  const code = pairingCode(8);
  const expiresAt = new Date(Date.now() + PAIRING_TTL_MS);
  await prisma.extensionPairing.create({ data: { userId: req.user.id, codeHash: hashToken(code), expiresAt } });
  created(res, { code, expiresAt });
}));

router.post('/exchange', limits.auth, handler(async (req, res) => {
  ensureEnabled();
  const { code, extensionId } = parse(z.object({
    code: z.string().trim().toUpperCase().regex(/^[A-Z2-9]{8}$/, 'Please type the 8-character code shown in Guidia.'),
    extensionId: z.string().regex(/^[a-p]{32}$/).optional(),
  }), req.body);

  const pairing = await prisma.extensionPairing.findUnique({ where: { codeHash: hashToken(code) } });
  if (!pairing || pairing.usedAt || pairing.expiresAt < new Date()) {
    throw new ApiError(400, 'That code is not valid any more. Please make a new one in Guidia.', 'PAIRING_CODE_INVALID');
  }
  const token = `gx_${randomToken(32)}`;
  await prisma.$transaction(async (tx) => {
    const { count } = await tx.extensionPairing.updateMany({ where: { id: pairing.id, usedAt: null }, data: { usedAt: new Date() } });
    if (count !== 1) throw new ApiError(400, 'That code was already used.', 'PAIRING_CODE_INVALID');
    await tx.extensionToken.create({
      data: { userId: pairing.userId, tokenHash: hashToken(token), scopes: SCOPES, extensionId: extensionId ?? null, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
    });
    await tx.consentRecord.create({ data: { userId: pairing.userId, type: 'EXTENSION_CONNECTION', policyVersion: '2026-10', scope: { scopes: SCOPES } } });
    await audit({ actorUserId: pairing.userId, action: AUDIT.EXTENSION_PAIRED, targetType: 'ExtensionToken', requestId: req.id }, tx);
  });
  const user = await prisma.user.findUnique({ where: { id: pairing.userId }, select: { fullName: true, preferredLanguage: true } });
  ok(res, { token, scopes: SCOPES, expiresAt: new Date(Date.now() + TOKEN_TTL_MS), user: { firstName: user.fullName.split(' ')[0], language: user.preferredLanguage } });
}));

router.get('/tokens', requireAuth, handler(async (req, res) => {
  ok(res, {
    tokens: await prisma.extensionToken.findMany({
      where: { userId: req.user.id, revokedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true, scopes: true, createdAt: true, lastUsedAt: true, expiresAt: true },
    }),
  });
}));

router.delete('/tokens/:id', requireAuth, handler(async (req, res) => {
  const { count } = await prisma.extensionToken.updateMany({ where: { id: req.params.id, userId: req.user.id, revokedAt: null }, data: { revokedAt: new Date() } });
  if (!count) throw new ApiError(404, 'That connection was not found.', 'NOT_FOUND');
  await audit({ actorUserId: req.user.id, action: AUDIT.EXTENSION_REVOKED, targetType: 'ExtensionToken', targetId: req.params.id, requestId: req.id });
  res.status(204).end();
}));

export default router;
