import { prisma } from '../config/prisma.js';

const withPreference = { preference: true };

export const userRepository = {
  findByEmail(email) {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() }, include: withPreference });
  },

  findById(id) {
    return prisma.user.findUnique({ where: { id }, include: withPreference });
  },

  create({ fullName, email, passwordHash, preferredLanguage, role = 'SENIOR' }) {
    return prisma.user.create({
      data: { fullName, email: email.toLowerCase(), passwordHash, preferredLanguage, role, preference: { create: {} } },
      include: withPreference,
    });
  },

  updateProfile(userId, data) {
    return prisma.user.update({ where: { id: userId }, data, include: withPreference });
  },

  async updatePreference(userId, { preferredLanguage, ...preferenceFields }) {
    return prisma.$transaction(async (tx) => {
      if (preferredLanguage) {
        await tx.user.update({ where: { id: userId }, data: { preferredLanguage } });
      }
      if (Object.keys(preferenceFields).length) {
        await tx.userPreference.upsert({
          where: { userId },
          create: { userId, ...preferenceFields },
          update: preferenceFields,
        });
      }
      return tx.user.findUnique({ where: { id: userId }, include: withPreference });
    });
  },

  // ── Sessions ────────────────────────────────────────────────────────
  createSession(data, tx = prisma) {
    return tx.session.create({ data });
  },

  findSessionByHash(tokenHash) {
    return prisma.session.findUnique({ where: { tokenHash } });
  },

  revokeSessionByHash(tokenHash, reason) {
    return prisma.session.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt: new Date(), revokeReason: reason } });
  },

  revokeFamily(familyId, reason) {
    return prisma.session.updateMany({ where: { familyId, revokedAt: null }, data: { revokedAt: new Date(), revokeReason: reason } });
  },

  listActiveSessions(userId) {
    return prisma.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true, userAgent: true, createdAt: true, lastUsedAt: true, expiresAt: true, familyId: true },
      orderBy: { lastUsedAt: 'desc' },
    });
  },

  // ── Password reset ──────────────────────────────────────────────────
  createPasswordResetToken({ userId, tokenHash, expiresAt }) {
    return prisma.$transaction([
      // Only the newest reset link works.
      prisma.passwordResetToken.updateMany({ where: { userId, usedAt: null }, data: { usedAt: new Date() } }),
      prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } }),
    ]);
  },

  findPasswordResetToken(tokenHash) {
    return prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  },

  async consumePasswordResetToken(tokenId, userId, passwordHash) {
    return prisma.$transaction(async (tx) => {
      // Conditional update = single-use even under concurrent submissions.
      const { count } = await tx.passwordResetToken.updateMany({ where: { id: tokenId, usedAt: null }, data: { usedAt: new Date() } });
      if (count !== 1) return false;
      await tx.user.update({ where: { id: userId }, data: { passwordHash } });
      // A reset forces re-authentication everywhere.
      await tx.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date(), revokeReason: 'password_reset' } });
      return true;
    });
  },
};
