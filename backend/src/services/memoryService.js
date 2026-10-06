import { prisma } from '../config/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import { redactSensitive } from '../security/sensitiveDataGuard.js';

// "Things I learned." Text is redacted on the way in — a Memory Book entry
// can never hold a PIN or OTP even if one was typed by mistake.

function clean(s) {
  return redactSensitive(s).text;
}

export const memoryService = {
  list(userId, { q, category, starred } = {}) {
    return prisma.memoryBookEntry.findMany({
      where: {
        userId,
        ...(category ? { category } : {}),
        ...(starred ? { starred: true } : {}),
        ...(q ? { OR: [{ title: { contains: q } }, { summary: { contains: q } }] } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  },

  create(userId, { title, category, summary, starred, skillKey }) {
    return prisma.memoryBookEntry.create({
      data: { userId, title: clean(title), category, summary: clean(summary), starred: starred ?? false, skillKey: skillKey ?? null },
    });
  },

  async setStarred(id, userId, starred) {
    const { count } = await prisma.memoryBookEntry.updateMany({ where: { id, userId }, data: { starred } });
    if (!count) throw new ApiError(404, 'That memory was not found.', 'NOT_FOUND');
    return prisma.memoryBookEntry.findUnique({ where: { id } });
  },

  async remove(id, userId) {
    const { count } = await prisma.memoryBookEntry.deleteMany({ where: { id, userId } });
    if (!count) throw new ApiError(404, 'That memory was not found.', 'NOT_FOUND');
  },
};
