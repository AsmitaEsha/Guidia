import { prisma } from '../config/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';

const MAX_CONTACTS = 10;
const blank = (v) => (v ? v : null);

function toPublic(c) {
  return { id: c.id, name: c.name, relationship: c.relationship, phone: c.phone, email: c.email, isPrimary: c.isPrimary, createdAt: c.createdAt };
}

// Emergency contacts: who a learner wants to reach when they press
// "I need help". Only the learner can see or change them.
export const emergencyContactService = {
  async list(userId) {
    const rows = await prisma.emergencyContact.findMany({ where: { userId }, orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] });
    return rows.map(toPublic);
  },

  async create(userId, data) {
    const count = await prisma.emergencyContact.count({ where: { userId } });
    if (count >= MAX_CONTACTS) throw new ApiError(400, `You can keep up to ${MAX_CONTACTS} people here.`, 'TOO_MANY_CONTACTS');
    const isPrimary = data.isPrimary ?? count === 0;
    return prisma.$transaction(async (tx) => {
      if (isPrimary) await tx.emergencyContact.updateMany({ where: { userId }, data: { isPrimary: false } });
      const row = await tx.emergencyContact.create({
        data: { userId, name: data.name, relationship: blank(data.relationship), phone: blank(data.phone), email: blank(data.email), isPrimary },
      });
      return toPublic(row);
    });
  },

  async update(userId, id, data) {
    const existing = await prisma.emergencyContact.findFirst({ where: { id, userId } });
    if (!existing) throw new ApiError(404, 'That contact was not found.', 'NOT_FOUND');
    return prisma.$transaction(async (tx) => {
      if (data.isPrimary) await tx.emergencyContact.updateMany({ where: { userId, NOT: { id } }, data: { isPrimary: false } });
      const row = await tx.emergencyContact.update({
        where: { id },
        data: { name: data.name, relationship: blank(data.relationship), phone: blank(data.phone), email: blank(data.email), ...(data.isPrimary != null ? { isPrimary: data.isPrimary } : {}) },
      });
      return toPublic(row);
    });
  },

  async remove(userId, id) {
    const { count } = await prisma.emergencyContact.deleteMany({ where: { id, userId } });
    if (!count) throw new ApiError(404, 'That contact was not found.', 'NOT_FOUND');
  },
};
