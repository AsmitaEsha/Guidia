import { prisma } from '../config/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import { redactObject } from '../security/sensitiveDataGuard.js';

const TASK_TTL_MS = 24 * 60 * 60 * 1000;
const OPEN_STATUSES = ['ACTIVE', 'PAUSED', 'WAITING_FOR_CONFIRMATION', 'WAITING_FOR_GUARDIAN'];

const include = {
  application: { select: { slug: true, displayName: true, currency: true } },
  lesson: { select: { slug: true, title: true, skillKey: true } },
  scenario: { select: { slug: true, title: true, skillKey: true, steps: { orderBy: { order: 'asc' } } } },
};

function toPublic(task) {
  if (!task) return null;
  const steps = task.scenario?.steps ?? [];
  return {
    id: task.id,
    status: task.status,
    goal: task.goal,
    language: task.language,
    application: task.application,
    lesson: task.lesson,
    scenario: task.scenario ? { slug: task.scenario.slug, title: task.scenario.title, skillKey: task.scenario.skillKey } : null,
    steps: steps.map((s) => ({ order: s.order, instruction: s.instruction, hint: s.hint, riskLevel: s.riskLevel, expectedAction: s.expectedAction ?? null })),
    currentStepOrder: task.currentStepOrder,
    totalSteps: steps.length,
    context: task.context,
    version: task.version,
    startedAt: task.startedAt,
    expiresAt: task.expiresAt,
  };
}

async function appendEvent(tx, taskSessionId, type, payload = {}) {
  const last = await tx.taskEvent.findFirst({ where: { taskSessionId }, orderBy: { sequence: 'desc' }, select: { sequence: true } });
  return tx.taskEvent.create({ data: { taskSessionId, sequence: (last?.sequence ?? -1) + 1, type, payload: redactObject(payload) } });
}

// Optimistic concurrency: the update only applies if nobody else changed
// the task since the caller read `version`.
async function guardedUpdate(tx, task, data) {
  const { count } = await tx.guidedTaskSession.updateMany({
    where: { id: task.id, version: task.version },
    data: { ...data, version: { increment: 1 } },
  });
  if (count !== 1) throw new ApiError(409, 'This task changed in another window. Please refresh.', 'TASK_VERSION_CONFLICT');
}

export const taskService = {
  appendEvent,
  toPublic,

  async getOwned(userId, id) {
    const task = await prisma.guidedTaskSession.findUnique({ where: { id }, include });
    if (!task || task.userId !== userId) throw new ApiError(404, 'That task was not found.', 'NOT_FOUND');
    return task;
  },

  async active(userId) {
    const task = await prisma.guidedTaskSession.findFirst({
      where: { userId, status: { in: OPEN_STATUSES }, expiresAt: { gt: new Date() } },
      orderBy: { updatedAt: 'desc' },
      include,
    });
    return toPublic(task);
  },

  async start(userId, { scenarioSlug, lessonSlug, applicationSlug, goal, language = 'en' }) {
    const [scenario, lesson, application] = await Promise.all([
      scenarioSlug ? prisma.scenario.findUnique({ where: { slug: scenarioSlug } }) : null,
      lessonSlug ? prisma.lesson.findUnique({ where: { slug: lessonSlug } }) : null,
      applicationSlug ? prisma.application.findUnique({ where: { slug: applicationSlug } }) : null,
    ]);
    if (scenarioSlug && (!scenario || scenario.status !== 'PUBLISHED')) throw new ApiError(404, 'That practice was not found.', 'NOT_FOUND');
    if (lessonSlug && (!lesson || lesson.status !== 'PUBLISHED')) throw new ApiError(404, 'That lesson was not found.', 'NOT_FOUND');

    return prisma.$transaction(async (tx) => {
      // One open task at a time keeps voice/chat/screenshots unambiguous.
      await tx.guidedTaskSession.updateMany({
        where: { userId, status: { in: OPEN_STATUSES } },
        data: { status: 'CANCELLED', version: { increment: 1 } },
      });
      const task = await tx.guidedTaskSession.create({
        data: {
          userId,
          scenarioId: scenario?.id ?? null,
          lessonId: lesson?.id ?? scenario?.lessonId ?? null,
          applicationId: application?.id ?? scenario?.applicationId ?? lesson?.applicationId ?? null,
          goal: goal ?? null,
          language,
          context: { hints: 0, errors: 0 },
          expiresAt: new Date(Date.now() + TASK_TTL_MS),
        },
      });
      await appendEvent(tx, task.id, 'TASK_STARTED', { scenarioSlug, lessonSlug, applicationSlug, goal });
      return toPublic(await tx.guidedTaskSession.findUnique({ where: { id: task.id }, include }));
    });
  },

  // Records a simulator action. If the scenario step declares an
  // expectedAction the result is checked server-side; otherwise the step is
  // completed by an explicit "done" from the UI.
  async recordAction(userId, id, { action, version }) {
    const task = await this.getOwned(userId, id);
    if (!OPEN_STATUSES.includes(task.status)) throw new ApiError(409, 'This task is already finished.', 'TASK_CLOSED');
    if (version != null && version !== task.version) throw new ApiError(409, 'This task changed in another window. Please refresh.', 'TASK_VERSION_CONFLICT');

    const step = task.scenario?.steps.find((s) => s.order === task.currentStepOrder);
    const expected = step?.expectedAction;
    const correct = !expected || expected === action;

    return prisma.$transaction(async (tx) => {
      if (correct) {
        await appendEvent(tx, task.id, 'ACTION_SUCCEEDED', { action, step: task.currentStepOrder });
        await guardedUpdate(tx, task, { currentStepOrder: task.currentStepOrder + 1, status: 'ACTIVE' });
      } else {
        await appendEvent(tx, task.id, 'ACTION_FAILED', { action, expected, step: task.currentStepOrder });
        const context = { ...task.context, errors: (task.context?.errors ?? 0) + 1 };
        await guardedUpdate(tx, task, { context });
      }
      const fresh = await tx.guidedTaskSession.findUnique({ where: { id: task.id }, include });
      return { correct, recovery: correct ? null : step?.recovery ?? step?.hint ?? null, task: toPublic(fresh) };
    });
  },

  async hint(userId, id) {
    const task = await this.getOwned(userId, id);
    const step = task.scenario?.steps.find((s) => s.order === task.currentStepOrder);
    await prisma.$transaction(async (tx) => {
      await appendEvent(tx, task.id, 'HINT_SHOWN', { step: task.currentStepOrder });
      await guardedUpdate(tx, task, { context: { ...task.context, hints: (task.context?.hints ?? 0) + 1 } });
    });
    return { hint: step?.hint ?? step?.instruction ?? null };
  },

  async setStatus(userId, id, status, eventType) {
    const task = await this.getOwned(userId, id);
    if (!OPEN_STATUSES.includes(task.status)) throw new ApiError(409, 'This task is already finished.', 'TASK_CLOSED');
    return prisma.$transaction(async (tx) => {
      await guardedUpdate(tx, task, {
        status,
        ...(status === 'PAUSED' ? { pausedAt: new Date() } : {}),
        ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
      });
      await appendEvent(tx, task.id, eventType);
      return toPublic(await tx.guidedTaskSession.findUnique({ where: { id: task.id }, include }));
    });
  },

  async events(userId, id) {
    await this.getOwned(userId, id);
    return prisma.taskEvent.findMany({ where: { taskSessionId: id }, orderBy: { sequence: 'asc' } });
  },

  // A short, trusted, secret-free description for AI prompts.
  async summaryForPrompt(userId) {
    const task = await prisma.guidedTaskSession.findFirst({
      where: { userId, status: { in: OPEN_STATUSES }, expiresAt: { gt: new Date() } },
      orderBy: { updatedAt: 'desc' },
      include,
    });
    if (!task) return { task: null, summary: null };
    const step = task.scenario?.steps.find((s) => s.order === task.currentStepOrder);
    const title = task.scenario?.title?.en || task.lesson?.title?.en || task.goal || 'a digital task';
    const parts = [`The user is working on "${title}"`];
    if (task.application) parts.push(`in ${task.application.displayName} (Guidia practice simulation)`);
    if (step) parts.push(`at step ${task.currentStepOrder + 1}: "${step.instruction?.en ?? ''}"`);
    return { task, summary: `${parts.join(' ')}.` };
  },
};
