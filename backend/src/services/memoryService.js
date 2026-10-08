import { prisma } from '../config/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import { redactSensitive } from '../security/sensitiveDataGuard.js';

// "Things I learned." Text is redacted on the way in — a Memory Book entry
// can never hold a PIN or OTP even if one was typed by mistake.

function clean(s) {
  return redactSensitive(s).text;
}

const LANGS = ['en', 'bn', 'hi', 'vi'];
const pick = (v, lang) => (v && typeof v === 'object' ? v[lang] || v.en || '' : v || '');

// Entries made from a lesson or a practice are saved in the language used
// at the time. When read, they are rebuilt from the source in the reader's
// language, so switching to English never leaves Bengali titles behind.
// Old entries without a link are matched by their title in any language.
let sourceCache = null;
async function sources() {
  if (sourceCache && sourceCache.at > Date.now() - 5 * 60_000) return sourceCache;
  const [lessons, scenarios] = await Promise.all([
    prisma.lesson.findMany({ select: { id: true, title: true, steps: { orderBy: { order: 'asc' }, select: { body: true } } } }),
    prisma.scenario.findMany({ select: { id: true, title: true, steps: { orderBy: { order: 'asc' }, select: { instruction: true } } } }),
  ]);
  const byLesson = new Map();
  const byTitle = new Map();
  for (const l of lessons) {
    const src = { title: l.title, parts: l.steps.map((s) => s.body) };
    byLesson.set(l.id, src);
    for (const lang of LANGS) if (l.title?.[lang]) byTitle.set(l.title[lang], src);
  }
  for (const sc of scenarios) {
    const src = { title: sc.title, parts: sc.steps.map((s) => s.instruction) };
    for (const lang of LANGS) if (sc.title?.[lang] && !byTitle.has(sc.title[lang])) byTitle.set(sc.title[lang], src);
  }
  sourceCache = { at: Date.now(), byLesson, byTitle };
  return sourceCache;
}

async function localize(entries, language) {
  if (!LANGS.includes(language) || !entries.length) return entries;
  const { byLesson, byTitle } = await sources();
  return entries.map((e) => {
    const src = (e.lessonId && byLesson.get(e.lessonId)) || byTitle.get(e.title);
    if (!src) return e;
    const title = pick(src.title, language) || e.title;
    const summary = src.parts.map((p) => pick(p, language)).join(' ').slice(0, 1000) || e.summary;
    return { ...e, title, summary };
  });
}

export const memoryService = {
  localize,

  async list(userId, { q, category, starred, language } = {}) {
    const entries = await prisma.memoryBookEntry.findMany({
      where: {
        userId,
        ...(category ? { category } : {}),
        ...(starred ? { starred: true } : {}),
        ...(q ? { OR: [{ title: { contains: q } }, { summary: { contains: q } }] } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return localize(entries, language);
  },

  create(userId, { title, category, summary, starred, skillKey }) {
    return prisma.memoryBookEntry.create({
      data: { userId, title: clean(title), category, summary: clean(summary), starred: starred ?? false, skillKey: skillKey ?? null },
    });
  },

  async setStarred(id, userId, starred) {
    const { count } = await prisma.memoryBookEntry.updateMany({ where: { id, userId }, data: { starred } });
    if (!count) throw new ApiError(404, 'That memory was not found.', 'NOT_FOUND');
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { preferredLanguage: true } });
    const [entry] = await localize([await prisma.memoryBookEntry.findUnique({ where: { id } })], user?.preferredLanguage);
    return entry;
  },

  async remove(id, userId) {
    const { count } = await prisma.memoryBookEntry.deleteMany({ where: { id, userId } });
    if (!count) throw new ApiError(404, 'That memory was not found.', 'NOT_FOUND');
  },
};
