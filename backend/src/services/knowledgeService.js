import { prisma } from '../config/prisma.js';

// Retrieval v1: multilingual keyword scoring over PUBLISHED knowledge
// chunks. Script-agnostic (works for Bengali, Devanagari, Vietnamese,
// Banglish) and needs no database-specific text search. Vector search
// (pgvector + ML-service embeddings) can replace `retrieve` behind
// FEATURE_RAG without changing callers.

const STOPWORDS = new Set([
  'the', 'and', 'for', 'how', 'can', 'what', 'with', 'this', 'that', 'you', 'your', 'are', 'from', 'want', 'need', 'please',
  'আমি', 'কি', 'কী', 'কীভাবে', 'কিভাবে', 'করব', 'করবো', 'চাই', 'এটা', 'এই', 'আমার',
  'मैं', 'कैसे', 'क्या', 'है', 'में', 'को', 'मेरा', 'यह',
  'tôi', 'làm', 'sao', 'thế', 'nào', 'của', 'này', 'muốn', 'là',
]);

// Romanised / alternative spellings → a term that appears in lessons.
const SYNONYMS = {
  taka: ['money', 'টাকা'], pathabo: ['send', 'পাঠান'], bkash: ['bkash'], bikash: ['bkash'], বিকাশ: ['bkash'], বিকাশে: ['bkash'],
  whatsapp: ['whatsapp'], হোয়াটসঅ্যাপ: ['whatsapp'], scam: ['scam'], প্রতারণা: ['scam'], otp: ['otp'], ওটিপি: ['otp'],
  doctor: ['doctor'], ডাক্তার: ['doctor'], photo: ['photo'], ছবি: ['photo'], chobi: ['photo'],
};

function terms(query) {
  const words = String(query || '')
    .toLowerCase()
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  const expanded = new Set(words);
  for (const w of words) for (const s of SYNONYMS[w] || []) expanded.add(s.toLowerCase());
  return [...expanded].slice(0, 12);
}

export const knowledgeService = {
  /**
   * @returns {Promise<Array<{ chunkId, documentId, documentSlug, version, content, score }>>}
   */
  async retrieve(query, { language = 'en', applicationSlug = null, limit = 4 } = {}) {
    const t = terms(query);
    if (!t.length) return [];
    const languages = language === 'en' ? ['en'] : [language, 'en'];

    const chunks = await prisma.knowledgeChunk.findMany({
      where: {
        document: { status: 'PUBLISHED', language: { in: languages } },
        OR: t.map((term) => ({ content: { contains: term } })),
      },
      include: { document: { select: { id: true, slug: true, version: true, language: true, applicationSlug: true } } },
      take: 200,
    });

    const scored = chunks.map((c) => {
      const text = c.content.toLowerCase();
      let score = t.reduce((acc, term) => acc + (text.includes(term) ? 1 : 0), 0);
      if (applicationSlug && c.document.applicationSlug === applicationSlug) score += 2;
      if (c.document.language === language) score += 0.5;
      return { c, score };
    });

    return scored
      .filter((s) => s.score >= 1.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ c, score }) => ({
        chunkId: c.id,
        documentId: c.document.id,
        documentSlug: c.document.slug,
        version: c.document.version,
        content: c.content,
        score,
      }));
  },
};
