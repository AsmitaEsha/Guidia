import { runRuleEngine, guidanceFor } from '../safety/rules.js';
import { fuseSafetySignals } from '../safety/fusion.js';
import { aiGateway } from '../ai/gateway.js';
import { safetyInterpretation } from '../ai/schemas.js';
import { safetySystemPrompt } from '../ai/prompts.js';
import { mlClient } from '../ml/mlClient.js';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { redactSensitive, redactObject } from '../security/sensitiveDataGuard.js';
import { fenceUntrusted } from '../security/promptGuard.js';
import { audit, AUDIT } from './auditService.js';

// Content that tries to make the reader *do* something (link, number,
// payment, code). Used to avoid a silent SAFE when no second opinion exists.
const ACTIONABLE = /https?:\/\/|www\.|\b\d{6,}\b|\b(click|tap|call|reply|send|pay|verify|login|log in)\b|লিংক|ক্লিক|পাঠান|लिंक|क्लिक|bấm|nhấp/i;

// The AI's second opinion only adds context; a person waiting on a scam
// check should never wait long for it. Past this budget the deterministic
// verdict is returned on its own.
const AI_BUDGET_MS = Number(process.env.SAFETY_AI_BUDGET_MS) || 12_000;

function withinBudget(promise) {
  let timer;
  const timeout = new Promise((resolve) => { timer = setTimeout(() => resolve(null), AI_BUDGET_MS); });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function aiInterpretation(args) {
  return withinBudget(askAi(args));
}

async function askAi({ content, ruleSeverity, language, userId, requestId }) {
  if (!aiGateway.isAvailable() || env.killSwitches.aiChat) return null;
  try {
    const { data, model } = await aiGateway.generateStructured({
      system: safetySystemPrompt({ language, ruleSeverity }),
      messages: [{ role: 'user', content: fenceUntrusted('message to check', content) }],
      name: safetyInterpretation.name,
      jsonSchema: safetyInterpretation.jsonSchema,
      zodSchema: safetyInterpretation.zodSchema,
      meta: { feature: 'scam_check', userId, requestId },
    });
    return { ...data, model };
  } catch {
    // The deterministic verdict is a complete answer on its own.
    return null;
  }
}

export const safetyService = {
  async analyze({ userId, contentType, content, language = 'en', requestId }) {
    const { text: redacted } = redactSensitive(content);
    const rule = runRuleEngine(redacted);
    const [ml, ai] = await Promise.all([
      mlClient.classifySafety(redacted, { requestId }),
      aiInterpretation({ content: redacted, ruleSeverity: rule.severity, language, userId, requestId }),
    ]);
    const { severity, decisionTrace } = fuseSafetySignals({ rule, ml, ai, looksActionable: ACTIONABLE.test(redacted) });
    const guidance = guidanceFor(severity);

    const result = {
      severity,
      whatLooksSuspicious: rule.signals.map((s) => s.reason),
      aiReasons: ai?.reasons ?? [],
      aiContext: ai?.explanation || null,
      whatToDo: guidance.whatToDo,
      whatToAvoid: guidance.whatToAvoid,
      sources: decisionTrace.raisedBy,
    };

    const record = await prisma.riskAssessment.create({
      data: {
        userId,
        contentType,
        contentExcerpt: redacted.slice(0, 500),
        severity,
        signals: rule.signals,
        explanation: result.aiContext || '',
        decisionTrace,
      },
    });
    if (severity === 'HIGH_RISK' || severity === 'CRITICAL') {
      await audit({ actorUserId: userId, actorType: 'SYSTEM', action: AUDIT.AI_SAFETY_DECISION, targetType: 'RiskAssessment', targetId: record.id, requestId, metadata: { severity, raisedBy: decisionTrace.raisedBy } });
    }
    return { id: record.id, ...result };
  },

  history(userId, limit = 20) {
    return prisma.riskAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, contentType: true, contentExcerpt: true, severity: true, signals: true, explanation: true, createdAt: true },
    });
  },

  async logInterception({ userId, actionType, summary, resolution, requestId }) {
    const record = await prisma.safetyInterception.create({
      data: { userId, actionType, summary: redactObject(summary), resolution },
    });
    await audit({ actorUserId: userId, action: AUDIT.SAFETY_INTERCEPTION, targetType: 'SafetyInterception', targetId: record.id, requestId, metadata: { actionType, resolution } });
    return record;
  },

  interceptionHistory(userId, limit = 20) {
    return prisma.safetyInterception.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit });
  },

  // "This warning seems wrong" / "this was a scam you missed". Stored for
  // human review only — never fed straight into model training.
  async feedback({ userId, assessmentId, verdict, requestId }) {
    const assessment = await prisma.riskAssessment.findFirst({ where: { id: assessmentId, userId } });
    if (!assessment) return null;
    await audit({ actorUserId: userId, action: 'SAFETY_FEEDBACK', targetType: 'RiskAssessment', targetId: assessmentId, requestId, metadata: { verdict, severity: assessment.severity } });
    return { recorded: true };
  },
};
