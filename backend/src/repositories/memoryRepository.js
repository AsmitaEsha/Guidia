import { prisma } from '../config/prisma.js';

export const memoryRepository = {
  list(userId) {
    return prisma.memoryBookEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  create({ userId, title, category, summary, starred }) {
    return prisma.memoryBookEntry.create({
      data: { userId, title, category, summary, starred: starred ?? false },
    });
  },

  findById(id) {
    return prisma.memoryBookEntry.findUnique({ where: { id } });
  },

  setStarred(id, starred) {
    return prisma.memoryBookEntry.update({ where: { id }, data: { starred } });
  },

  remove(id) {
    return prisma.memoryBookEntry.delete({ where: { id } });
  },
};
