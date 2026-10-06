import { prisma } from '../config/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import { progressService, memoryCategoryFor } from './progressService.js';
import { taskService } from './taskService.js';

const published = { status: 'PUBLISHED' };

function pick(localized, language) {
  if (!localized || typeof localized !== 'object') return localized ?? '';
  return localized[language] || localized.en || Object.values(localized)[0] || '';
}

export const learningService = {
  applications() {
    return prisma.application.findMany({
      where: { isActive: true },
      orderBy: { displayName: 'asc' },
      select: { slug: true, displayName: true, category: true, countryCodes: true, currency: true, riskProfile: true, hasSimulation: true },
    });
  },

  async lessons({ domain } = {}) {
    return prisma.lesson.findMany({
      where: { ...published, ...(domain ? { domain } : {}) },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true, slug: true, domain: true, category: true, difficulty: true, estimatedMinutes: true, skillKey: true, title: true, description: true,
        application: { select: { slug: true, displayName: true } },
        _count: { select: { steps: true } },
      },
    });
  },

  async lesson(slug) {
    const lesson = await prisma.lesson.findFirst({
      where: { slug, ...published },
      include: { steps: { orderBy: { order: 'asc' } }, application: { select: { slug: true, displayName: true } } },
    });
    if (!lesson) throw new ApiError(404, 'That lesson was not found.', 'NOT_FOUND');
    return lesson;
  },

  scenarios({ application } = {}) {
    return prisma.scenario.findMany({
      where: { ...published, ...(application ? { application: { slug: application } } : {}) },
      orderBy: [{ application: { displayName: 'asc' } }, { slug: 'asc' }],
      select: { slug: true, title: true, difficulty: true, skillKey: true, application: { select: { slug: true, displayName: true } }, _count: { select: { steps: true } } },
    });
  },

  // Lesson completion: attempt + skill + Memory Book entry in one commit.
  async completeLesson(userId, slug, { confidence = null, language = 'en' } = {}) {
    const lesson = await this.lesson(slug);
    return prisma.$transaction(async (tx) => {
      const skill = await progressService.recordAttempt(tx, userId, { skillKey: lesson.skillKey, outcome: 'SUCCESS', independent: false, confidence });
      const lastStep = lesson.steps[lesson.steps.length - 1];
      const memory = await tx.memoryBookEntry.create({
        data: {
          userId,
          title: pick(lesson.title, language),
          category: memoryCategoryFor(lesson.skillKey),
          summary: (lesson.steps.map((s) => pick(s.body, language)).join(' ') || pick(lastStep?.body, language)).slice(0, 1000),
          skillKey: lesson.skillKey,
          lessonId: lesson.id,
        },
      });
      return { skill, memory };
    });
  },

  // Practice completion from a GuidedTaskSession. Independence is earned,
  // not claimed: no hints and no wrong actions during the task.
  async completeTask(userId, taskId, { outcome = 'SUCCESS', confidence = null, language = 'en' } = {}) {
    const task = await taskService.getOwned(userId, taskId);
    if (!['ACTIVE', 'PAUSED', 'WAITING_FOR_CONFIRMATION', 'WAITING_FOR_GUARDIAN'].includes(task.status)) {
      throw new ApiError(409, 'This task is already finished.', 'TASK_CLOSED');
    }
    const hints = task.context?.hints ?? 0;
    const errors = task.context?.errors ?? 0;
    const skillKey = task.scenario?.skillKey || task.lesson?.skillKey || (task.goal ? `task.${task.goal.toLowerCase()}` : 'task.general');

    return prisma.$transaction(async (tx) => {
      const { count } = await tx.guidedTaskSession.updateMany({
        where: { id: task.id, version: task.version },
        data: { status: outcome === 'SUCCESS' ? 'COMPLETED' : 'CANCELLED', completedAt: new Date(), version: { increment: 1 } },
      });
      if (count !== 1) throw new ApiError(409, 'This task changed in another window. Please refresh.', 'TASK_VERSION_CONFLICT');
      await taskService.appendEvent(tx, task.id, outcome === 'SUCCESS' ? 'TASK_COMPLETED' : 'TASK_CANCELLED', { hints, errors });

      const skill = await progressService.recordAttempt(tx, userId, {
        skillKey,
        outcome,
        independent: outcome === 'SUCCESS' && hints === 0 && errors === 0,
        hintCount: hints,
        errorCount: errors,
        durationMs: Date.now() - task.startedAt.getTime(),
        scenarioId: task.scenarioId,
        taskSessionId: task.id,
        applicationSlug: task.application?.slug ?? null,
        confidence,
      });

      let memory = null;
      if (outcome === 'SUCCESS') {
        const title = pick(task.scenario?.title, language) || pick(task.lesson?.title, language) || 'Practice completed';
        memory = await tx.memoryBookEntry.create({
          data: {
            userId,
            title,
            category: memoryCategoryFor(skillKey),
            summary: task.scenario?.steps?.map((s) => pick(s.instruction, language)).join(' ').slice(0, 1000) || title,
            skillKey,
          },
        });
      }
      return { skill, memory, independent: hints === 0 && errors === 0 };
    });
  },
};
