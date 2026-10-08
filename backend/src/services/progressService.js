import { prisma } from '../config/prisma.js';

// Learning model
// - competence: what the user can do, from practice outcomes.
// - confidence: how comfortable they say they feel (self-reported only —
//   never inferred from age or anything else). Null until they tell us.
// - mastery: NEW → GUIDED → PRACTICING → INDEPENDENT → RETAINED → MASTERED.
//   Completing a lesson ≠ mastery; independence and later recall count.
// - Spaced review: a success schedules the next review (1 / 7 / 30 days).

const DAY = 24 * 60 * 60_000;
const REVIEW_AFTER = { GUIDED: 1, PRACTICING: 1, INDEPENDENT: 7, RETAINED: 30, MASTERED: 60 };

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

export function memoryCategoryFor(skillKey = '') {
  const prefix = skillKey.split('.')[0];
  return { messaging: 'MESSAGING', payments: 'BANKING', safety: 'SAFETY', info: 'SAFETY', privacy: 'PRIVACY', ai: 'PRIVACY', social: 'SOCIAL', email: 'MESSAGING' }[prefix] || 'LEARNING';
}

export function nextSkillState(prev, { outcome, independent, hintCount = 0, confidence = null, now = new Date() }) {
  const s = {
    attempts: (prev?.attempts ?? 0) + 1,
    successfulAttempts: (prev?.successfulAttempts ?? 0) + (outcome === 'SUCCESS' ? 1 : 0),
    failedAttempts: (prev?.failedAttempts ?? 0) + (outcome === 'FAILED' ? 1 : 0),
    independentSuccesses: (prev?.independentSuccesses ?? 0) + (outcome === 'SUCCESS' && independent ? 1 : 0),
    hintsUsed: (prev?.hintsUsed ?? 0) + hintCount,
  };

  // Damped success rate (one imaginary miss) so one lucky try isn't 100%.
  const successRate = s.successfulAttempts / (s.attempts + 1);
  const independence = Math.min(1, s.independentSuccesses / 2);
  const competenceScore = clamp(100 * (0.6 * successRate + 0.4 * independence));

  const confidenceScore = confidence == null
    ? prev?.confidenceScore ?? 0
    : clamp(prev?.confidenceScore ? 0.6 * prev.confidenceScore + 0.4 * (confidence * 20) : confidence * 20);

  // Was this attempt a scheduled review?
  const isReview = Boolean(prev?.nextReviewAt && now >= prev.nextReviewAt && (prev?.successfulAttempts ?? 0) > 0);
  let retentionScore = prev?.retentionScore ?? null;
  if (isReview) {
    const recall = outcome === 'SUCCESS' && independent ? 100 : outcome === 'SUCCESS' ? 60 : 20;
    retentionScore = clamp(retentionScore == null ? recall : 0.5 * retentionScore + 0.5 * recall);
  }

  let masteryLevel = 'NEW';
  if (s.successfulAttempts > 0) masteryLevel = s.independentSuccesses > 0 ? 'INDEPENDENT' : hintCount > 0 ? 'GUIDED' : 'PRACTICING';
  if (masteryLevel === 'INDEPENDENT' && retentionScore != null && retentionScore >= 60) masteryLevel = 'RETAINED';
  if (masteryLevel === 'RETAINED' && s.independentSuccesses >= 3 && retentionScore >= 80) masteryLevel = 'MASTERED';

  const nextReviewAt = outcome === 'SUCCESS'
    ? new Date(now.getTime() + (REVIEW_AFTER[masteryLevel] ?? 1) * DAY)
    : prev?.nextReviewAt ?? null;

  return { ...s, competenceScore, confidenceScore, retentionScore, masteryLevel, lastPracticedAt: now, nextReviewAt };
}

export const progressService = {
  /** Records an attempt and updates the skill. Pass the transaction client. */
  async recordAttempt(tx, userId, { skillKey, outcome, independent = false, hintCount = 0, errorCount = 0, durationMs = null, scenarioId = null, taskSessionId = null, applicationSlug = null, confidence = null }) {
    await tx.practiceAttempt.create({ data: { userId, skillKey, outcome, independent, hintCount, errorCount, durationMs, scenarioId, taskSessionId, applicationSlug } });
    const prev = await tx.userSkill.findUnique({ where: { userId_skillKey: { userId, skillKey } } });
    const next = nextSkillState(prev, { outcome, independent, hintCount, confidence });
    return tx.userSkill.upsert({ where: { userId_skillKey: { userId, skillKey } }, create: { userId, skillKey, ...next }, update: next });
  },

  async me(userId) {
    const [skills, attempts, memoryLessons, risk, interceptions, memoryDates] = await Promise.all([
      prisma.userSkill.findMany({ where: { userId }, orderBy: { lastPracticedAt: 'desc' } }),
      prisma.practiceAttempt.groupBy({ by: ['outcome', 'independent'], where: { userId }, _count: true }),
      prisma.memoryBookEntry.findMany({ where: { userId, lessonId: { not: null } }, distinct: ['lessonId'], select: { lessonId: true } }),
      prisma.riskAssessment.groupBy({ by: ['severity'], where: { userId }, _count: true }),
      prisma.safetyInterception.count({ where: { userId } }),
      prisma.practiceAttempt.findMany({ where: { userId }, select: { createdAt: true }, orderBy: { createdAt: 'desc' }, take: 500 }),
    ]);

    const total = attempts.reduce((n, a) => n + a._count, 0);
    const independentSuccess = attempts.filter((a) => a.outcome === 'SUCCESS' && a.independent).reduce((n, a) => n + a._count, 0);
    const successes = attempts.filter((a) => a.outcome === 'SUCCESS').reduce((n, a) => n + a._count, 0);
    const withConfidence = skills.filter((s) => s.confidenceScore > 0);
    const scamsChecked = risk.reduce((n, r) => n + r._count, 0);
    const scamsRecognized = risk.filter((r) => r.severity !== 'SAFE').reduce((n, r) => n + r._count, 0);
    const now = new Date();

    return {
      competence: skills.length ? clamp(skills.reduce((n, s) => n + s.competenceScore, 0) / skills.length) : 0,
      confidence: withConfidence.length ? clamp(withConfidence.reduce((n, s) => n + s.confidenceScore, 0) / withConfidence.length) : null,
      // North-star: share of attempts completed successfully without help.
      independentCompletionRate: total ? clamp((100 * independentSuccess) / total) : null,
      lessonsCompleted: memoryLessons.length,
      practiceAttempts: total,
      practiceSuccesses: successes,
      scamsChecked,
      scamsRecognized,
      safetyInterceptions: interceptions,
      activeDays: new Set(memoryDates.map((d) => d.createdAt.toDateString())).size,
      skills: skills.map((s) => ({
        skillKey: s.skillKey,
        masteryLevel: s.masteryLevel,
        competence: s.competenceScore,
        confidence: s.confidenceScore || null,
        retention: s.retentionScore,
        attempts: s.attempts,
        independentSuccesses: s.independentSuccesses,
        lastPracticedAt: s.lastPracticedAt,
        nextReviewAt: s.nextReviewAt,
        dueForReview: Boolean(s.nextReviewAt && s.nextReviewAt <= now),
      })),
    };
  },

  // Guardian-safe summary (requires LEARNING_PROGRESS scope — checked by caller).
  async summary(userId) {
    const p = await this.me(userId);
    return {
      competence: p.competence,
      confidence: p.confidence,
      independentCompletionRate: p.independentCompletionRate,
      lessonsCompleted: p.lessonsCompleted,
      skills: p.skills.map(({ skillKey, masteryLevel }) => ({ skillKey, masteryLevel })),
    };
  },
};
