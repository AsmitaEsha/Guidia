import { runRuleEngine, guidanceFor, maxSeverity } from '../safety/rules.js';
import { aiGateway } from '../ai/gateway.js';
import { prisma } from '../config/prisma.js';

// AI may only ever raise the severity the deterministic rule engine
// produced (or leave it unchanged) — never lower it. If the AI call fails
// or isn't configured, the deterministic result alone is still a complete,
// usable answer: scam detection must not depend on an optional feature.
async function getAiInterpretation(content, ruleSeverity) {
  if (!aiGateway.isAvailable()) return null;

  const systemInstruction = [
    'You are a safety analyst helping detect scams for senior citizens.',
    'You will be given a message and a baseline risk severity already determined by rules.',
    'Reply with a short, plain-language paragraph (2-3 sentences) giving additional context on why this message is or is not risky.',
    'Then on a new line write exactly one of: SEVERITY: SAFE, SEVERITY: WARNING, SEVERITY: HIGH_RISK, or SEVERITY: CRITICAL — your assessment, which may only match or exceed the given baseline, never go below it.',
    `Baseline severity: ${ruleSeverity}.`,
  ].join(' ');

  try {
    const text = await aiGateway.generateText({ prompt: content, systemInstruction });
    const match = /SEVERITY:\s*(SAFE|WARNING|HIGH_RISK|CRITICAL)/i.exec(text);
    const suggested = match ? match[1].toUpperCase() : ruleSeverity;
    const commentary = text.replace(/SEVERITY:\s*(SAFE|WARNING|HIGH_RISK|CRITICAL)/i, '').trim();
    return { commentary, severity: maxSeverity(ruleSeverity, suggested) };
  } catch {
    return null;
  }
}

export const safetyService = {
  async analyze({ userId, contentType, content }) {
    const rule = runRuleEngine(content);
    const ai = await getAiInterpretation(content, rule.severity);
    const finalSeverity = ai ? maxSeverity(rule.severity, ai.severity) : rule.severity;
    const guidance = guidanceFor(finalSeverity);

    const result = {
      severity: finalSeverity,
      whatLooksSuspicious: rule.signals.map((s) => s.reason),
      aiContext: ai?.commentary || null,
      whatToDo: guidance.whatToDo,
      whatToAvoid: guidance.whatToAvoid,
    };

    await prisma.riskAssessment.create({
      data: {
        userId,
        contentType,
        contentExcerpt: content.slice(0, 500),
        severity: finalSeverity,
        signals: JSON.stringify(rule.signals),
        explanation: result.aiContext || '',
      },
    });

    return result;
  },

  history(userId, limit = 20) {
    return prisma.riskAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  // Logs a Psychological Safety Net interception (GuidiaSafetyPanel on the
  // frontend) — a record that the user was shown the "what/who/amount/what
  // happens next" breakdown before a sensitive action, and what they chose.
  logInterception({ userId, actionType, summary, resolution }) {
    return prisma.safetyInterception.create({
      data: { userId, actionType, summary: JSON.stringify(summary), resolution },
    });
  },

  interceptionHistory(userId, limit = 20) {
    return prisma.safetyInterception.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },
};
