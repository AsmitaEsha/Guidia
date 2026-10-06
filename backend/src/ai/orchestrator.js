import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { normalizeLanguage } from '../config/languages.js';
import { ApiError } from '../middleware/errorHandler.js';
import { aiGateway } from './gateway.js';
import { assistantReply } from './schemas.js';
import { assistantSystemPrompt } from './prompts.js';
import { SENSITIVE_INTENTS } from './intents.js';
import { mlClient } from '../ml/mlClient.js';
import { redactSensitive } from '../security/sensitiveDataGuard.js';
import { fenceUntrusted, looksLikeInjection } from '../security/promptGuard.js';
import { runRuleEngine } from '../safety/rules.js';
import { evaluateAction } from '../safety/riskEngine.js';
import { toMinor } from '../lib/currency.js';
import { knowledgeService } from '../services/knowledgeService.js';
import { taskService } from '../services/taskService.js';
import { conversationService } from '../services/conversationService.js';

const HISTORY_TURNS = 6;
const APP_CURRENCY = { bkash: 'BDT', nagad: 'BDT', momo: 'VND', googlepay: 'INR', paypal: 'USD' };

function normalize(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().slice(0, 2000);
}

// Verified-content answer used when AI is off: the whole reviewed lesson
// the best match came from — never a fabricated reply.
async function knowledgeOnlyReply(knowledge) {
  const doc = await prisma.knowledgeDocument.findUnique({
    where: { id: knowledge[0].documentId },
    include: { chunks: { orderBy: { ordinal: 'asc' } } },
  });
  return {
    reply: doc.title,
    steps: doc.chunks.map((c) => c.content.replace(/^[^:]+:\s*/, '')),
    intent: 'LEARN_APP',
    grounding: 'VERIFIED_GUIDIA',
    needsClarification: false,
    clarifyingQuestion: '',
    safetyNote: '',
    actionProposal: null,
  };
}

/**
 * Handles one assistant turn for an authenticated user.
 * Returns only display-safe data; persists only redacted text.
 */
export async function handleAssistantTurn({ userId, message, conversationId, language, cognitiveState = 'CALM', source = 'TEXT', requestId }) {
  const lang = normalizeLanguage(language);
  const normalized = normalize(message);
  if (!normalized) throw new ApiError(400, 'Please type a question.', 'VALIDATION_ERROR');

  // 1. Secrets never go further than this line.
  const { text: redacted, count: redactions } = redactSensitive(normalized);
  const injectionSuspected = looksLikeInjection(redacted);

  // 2. Intent (HF model, or deterministic fallback marked degraded).
  const intent = await mlClient.classifyIntent(redacted, { requestId });

  // 3. Shared task context.
  const { task, summary: taskSummary } = await taskService.summaryForPrompt(userId);

  // 4. Deterministic safety on the message itself (users often paste a
  //    suspicious SMS and ask about it).
  const rule = runRuleEngine(redacted);
  const safetyContext = rule.severity !== 'SAFE'
    ? `The user's message contains warning signs (${rule.severity}): ${rule.signals.map((s) => s.reason).join(' ')} Be clear and calm about the risk.`
    : redactions > 0
      ? 'The user just typed a secret (it was removed before reaching you). Kindly remind them never to share it with anyone, including Guidia.'
      : null;

  // 5. Verified knowledge.
  const knowledge = env.features.rag
    ? await knowledgeService.retrieve(redacted, { language: lang, applicationSlug: task?.application?.slug ?? null })
    : [];

  const conversation = await conversationService.getOrCreate(userId, conversationId, { language: lang, taskSessionId: task?.id ?? null });
  const history = await conversationService.recentForPrompt(conversation.id, HISTORY_TURNS);

  let result;
  let model = null;
  let degraded = intent.degraded;

  const aiOff = !aiGateway.isAvailable() || env.killSwitches.aiChat;
  if (aiOff) {
    if (!knowledge.length) {
      throw new ApiError(503, "Guidia's AI helper is switched off right now. You can still open Learn, Practice and the scam checker.", 'AI_NOT_CONFIGURED');
    }
    result = await knowledgeOnlyReply(knowledge);
    degraded = true;
  } else {
    const system = assistantSystemPrompt({ language: lang, cognitiveState, taskSummary, knowledge, safetyContext });
    const messages = [
      ...history,
      { role: 'user', content: fenceUntrusted(source === 'VOICE' ? 'voice transcript' : 'user message', redacted) },
    ];
    const out = await aiGateway.generateStructured({
      system,
      messages,
      name: assistantReply.name,
      jsonSchema: assistantReply.jsonSchema,
      zodSchema: assistantReply.zodSchema,
      meta: { feature: 'assistant', userId, requestId, degraded },
    });
    result = out.data;
    model = out.model;
  }

  // 6. Any money-related proposal from the model is only a preview; the
  //    deterministic Safety Engine decides what it would require.
  let proposedAction = null;
  if (result.actionProposal && result.actionProposal.actionType !== 'NONE') {
    const p = result.actionProposal;
    const appSlug = p.application.toLowerCase().replace(/[^a-z]/g, '');
    const currency = p.currency || APP_CURRENCY[appSlug] || null;
    const amountMinor = p.amount != null && currency ? toMinor(p.amount, currency) : null;
    const evaluation = evaluateAction({
      actionType: p.actionType,
      amountMinor,
      currency,
      contextRisk: rule.severity === 'CRITICAL' ? 'CRITICAL' : rule.severity === 'HIGH_RISK' ? 'HIGH' : 'LOW',
      sensitiveActionsDisabled: env.killSwitches.sensitiveActions,
    });
    proposedAction = {
      actionType: p.actionType,
      application: appSlug,
      recipientLabel: redactSensitive(p.recipientLabel).text,
      amountMinor,
      currency,
      evaluation,
      isSimulation: true,
    };
  }

  // Sensitive topics answered without verified knowledge must carry a
  // safety note — Guidia is never casually confident about money.
  if (SENSITIVE_INTENTS.has(result.intent) && result.grounding !== 'VERIFIED_GUIDIA' && !result.safetyNote) {
    result.safetyNote = 'Check every detail in the official app before you confirm. Never share your PIN or OTP.';
  }

  // 7. Persist redacted turn + provenance.
  const provenance = knowledge.map((k) => ({ documentId: k.documentId, chunkId: k.chunkId, slug: k.documentSlug, version: k.version }));
  await conversationService.appendTurn(conversation.id, {
    user: { content: redacted, redactions, intent: intent.intent, intentConfidence: intent.confidence, riskLevel: rule.severity },
    assistant: {
      content: [result.reply, ...result.steps.map((s, i) => `${i + 1}. ${s}`), result.safetyNote].filter(Boolean).join('\n'),
      intent: result.intent,
      grounding: result.grounding,
      provenance,
      structured: { ...result, proposedAction },
      provider: aiOff ? 'knowledge' : aiGateway.providerName(),
      model,
      riskLevel: rule.severity,
    },
  });

  return {
    conversationId: conversation.id,
    reply: result.reply,
    steps: result.steps,
    safetyNote: result.safetyNote,
    needsClarification: result.needsClarification,
    clarifyingQuestion: result.clarifyingQuestion,
    intent: result.intent,
    intentSource: intent.source,
    grounding: result.grounding,
    sources: [...new Set(knowledge.map((k) => k.documentSlug))].map((slug) => ({ slug })),
    messageRisk: rule.severity,
    secretsRemoved: redactions,
    injectionSuspected,
    proposedAction,
    taskId: task?.id ?? null,
    degraded,
  };
}

export async function conversationExists(userId, id) {
  const c = await prisma.conversation.findUnique({ where: { id }, select: { userId: true } });
  return Boolean(c && c.userId === userId);
}
