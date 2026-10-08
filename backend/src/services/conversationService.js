import { prisma } from '../config/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';

// Conversation history = "what we talked about". Separate from the Memory
// Book ("what I learned"), preferences and task state. Content is always
// stored already redacted.

export const conversationService = {
  async getOrCreate(userId, conversationId, { language, taskSessionId, mode = 'ASSISTANT' } = {}) {
    if (conversationId) {
      const existing = await prisma.conversation.findUnique({ where: { id: conversationId } });
      if (!existing || existing.userId !== userId) throw new ApiError(404, 'That conversation was not found.', 'NOT_FOUND');
      return existing;
    }
    return prisma.conversation.create({ data: { userId, language, taskSessionId, mode } });
  },

  // Recent turns in provider message format. Assistant turns are trusted
  // (Guidia wrote them); user turns are re-fenced by the caller's prompt
  // rules via their stored redacted form.
  async recentForPrompt(conversationId, turns = 6) {
    const rows = await prisma.conversationMessage.findMany({
      where: { conversationId, role: { in: ['USER', 'ASSISTANT'] } },
      orderBy: { createdAt: 'desc' },
      take: turns * 2,
      select: { role: true, content: true },
    });
    return rows.reverse().map((r) => ({
      role: r.role === 'USER' ? 'user' : 'assistant',
      content: r.role === 'USER' ? `<<<UNTRUSTED earlier user message\n${r.content.replace(/<<<|>>>/g, '«»')}\nUNTRUSTED>>>` : r.content,
    }));
  },

  async appendTurn(conversationId, { user, assistant }) {
    await prisma.$transaction([
      prisma.conversationMessage.create({ data: { conversationId, role: 'USER', ...user } }),
      prisma.conversationMessage.create({ data: { conversationId, role: 'ASSISTANT', ...assistant } }),
      prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } }),
      // The first (already redacted) question becomes the history title.
      prisma.conversation.updateMany({
        where: { id: conversationId, title: null },
        data: { title: String(user.content || '').replace(/\s+/g, ' ').trim().slice(0, 80) || null },
      }),
    ]);
  },

  list(userId, { limit = 20 } = {}) {
    return prisma.conversation.findMany({
      where: { userId, status: 'ACTIVE' },
      orderBy: { lastMessageAt: 'desc' },
      take: Math.min(limit, 50),
      select: { id: true, title: true, language: true, mode: true, createdAt: true, lastMessageAt: true },
    });
  },

  async get(userId, id) {
    const c = await prisma.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' }, select: { id: true, role: true, content: true, intent: true, grounding: true, structured: true, createdAt: true } } },
    });
    if (!c || c.userId !== userId) throw new ApiError(404, 'That conversation was not found.', 'NOT_FOUND');
    return c;
  },

  async remove(userId, id) {
    const { count } = await prisma.conversation.deleteMany({ where: { id, userId } });
    if (!count) throw new ApiError(404, 'That conversation was not found.', 'NOT_FOUND');
  },
};
