import { prisma } from '../config/prisma.js';

// Confidence and competence are kept as two separate numbers rather than
// one blended score (README: "Guidia distinguishes between confidence and
// competence"). Competence here is derived from real completed activity;
// confidence is currently a direct read of the user's self-reported
// Cognitive Load Governor state — an honest starting heuristic, not a
// learned model. Both are documented as such rather than presented as more
// sophisticated than they are.
const CONFIDENCE_BY_STATE = { CALM: 80, UNSURE: 50, SCARED: 25 };

export const progressService = {
  async me(userId) {
    const [preference, memoryEntries, riskAssessments, interceptions] = await Promise.all([
      prisma.userPreference.findUnique({ where: { userId } }),
      prisma.memoryBookEntry.findMany({ where: { userId }, select: { category: true, createdAt: true } }),
      prisma.riskAssessment.findMany({ where: { userId }, select: { severity: true } }),
      prisma.safetyInterception.count({ where: { userId } }),
    ]);

    const lessonsCompleted = memoryEntries.filter((m) => m.category === 'LEARNING').length;
    const scamsChecked = riskAssessments.length;
    const scamsRecognized = riskAssessments.filter((r) => r.severity !== 'SAFE').length;

    const categoryCounts = memoryEntries.reduce((acc, m) => {
      const key = m.category.toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // A simple day-count "streak" derived from real memory entry dates,
    // rather than a hardcoded number.
    const activeDays = new Set(memoryEntries.map((m) => new Date(m.createdAt).toDateString()));

    const confidence = CONFIDENCE_BY_STATE[preference?.cognitiveState] ?? CONFIDENCE_BY_STATE.CALM;
    const competence = Math.min(100, lessonsCompleted * 15 + scamsRecognized * 10 + interceptions * 5);

    return {
      confidence,
      competence,
      lessonsCompleted,
      scamsChecked,
      scamsRecognized,
      safetyInterceptions: interceptions,
      activeDays: activeDays.size,
      categoryCounts,
    };
  },
};
