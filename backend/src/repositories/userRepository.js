import { prisma } from '../config/prisma.js';

export const userRepository = {
  findByEmail(email) {
    return prisma.user.findUnique({ where: { email }, include: { preference: true } });
  },

  findById(id) {
    return prisma.user.findUnique({ where: { id }, include: { preference: true } });
  },

  create({ fullName, email, passwordHash, preferredLanguage }) {
    return prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        preferredLanguage,
        preference: { create: {} },
      },
      include: { preference: true },
    });
  },

  createSession({ userId, refreshToken, userAgent, expiresAt }) {
    return prisma.session.create({
      data: { userId, refreshToken, userAgent, expiresAt },
    });
  },

  findSessionByToken(refreshToken) {
    return prisma.session.findUnique({ where: { refreshToken } });
  },

  revokeSession(refreshToken) {
    return prisma.session.updateMany({
      where: { refreshToken },
      data: { revokedAt: new Date() },
    });
  },

  async updatePreference(userId, { preferredLanguage, ...preferenceFields }) {
    const [, updated] = await prisma.$transaction([
      ...(preferredLanguage
        ? [prisma.user.update({ where: { id: userId }, data: { preferredLanguage } })]
        : [prisma.user.findUniqueOrThrow({ where: { id: userId } })]),
      prisma.userPreference.update({ where: { userId }, data: preferenceFields }),
    ]);
    return updated;
  },

  createPasswordResetToken({ userId, token, expiresAt }) {
    return prisma.passwordResetToken.create({ data: { userId, token, expiresAt } });
  },

  findPasswordResetToken(token) {
    return prisma.passwordResetToken.findUnique({ where: { token } });
  },

  async consumePasswordResetToken(tokenId, userId, passwordHash) {
    await prisma.$transaction([
      prisma.passwordResetToken.update({ where: { id: tokenId }, data: { usedAt: new Date() } }),
      prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      // Resetting a password revokes every existing session — a reset
      // should force re-authentication everywhere, not just locally.
      prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
  },

  updateSessionExpiry(refreshToken, expiresAt) {
    return prisma.session.updateMany({ where: { refreshToken }, data: { expiresAt } });
  },
};
