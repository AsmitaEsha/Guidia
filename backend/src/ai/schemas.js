import { z } from 'zod';
import { INTENTS } from './intents.js';

// Each structured AI output has a JSON Schema (sent to the provider, strict
// mode: every property required, no extras) and a zod schema (re-validates
// the reply — model output is untrusted input).

const GROUNDING = ['VERIFIED_GUIDIA', 'SIMULATION', 'USER_PROVIDED', 'MODEL_INTERPRETATION', 'UNKNOWN'];
const ACTION_TYPES = ['SEND_MONEY', 'PURCHASE', 'PAID_BOOKING', 'BOOK_APPOINTMENT', 'SEND_MESSAGE', 'SEND_EMAIL', 'PAY_BILL', 'NONE'];

export const assistantReply = {
  name: 'assistant_reply',
  jsonSchema: {
    type: 'object',
    additionalProperties: false,
    required: ['reply', 'steps', 'intent', 'grounding', 'needsClarification', 'clarifyingQuestion', 'safetyNote', 'actionProposal'],
    properties: {
      reply: { type: 'string', description: 'Short, calm answer in the user language. No markdown tables.' },
      steps: { type: 'array', items: { type: 'string' }, description: 'Numbered steps, one action each, empty if not a how-to.' },
      intent: { type: 'string', enum: INTENTS },
      grounding: { type: 'string', enum: GROUNDING },
      needsClarification: { type: 'boolean' },
      clarifyingQuestion: { type: 'string' },
      safetyNote: { type: 'string', description: 'One-sentence safety reminder when money, passwords, OTPs or personal data are involved; otherwise empty.' },
      actionProposal: {
        anyOf: [
          { type: 'null' },
          {
            type: 'object',
            additionalProperties: false,
            required: ['actionType', 'application', 'recipientLabel', 'amount', 'currency'],
            properties: {
              actionType: { type: 'string', enum: ACTION_TYPES },
              application: { type: 'string' },
              recipientLabel: { type: 'string' },
              amount: { type: ['number', 'null'] },
              currency: { type: ['string', 'null'] },
            },
          },
        ],
      },
    },
  },
  zodSchema: z.object({
    reply: z.string().max(4000),
    steps: z.array(z.string().max(500)).max(12),
    intent: z.enum(INTENTS),
    grounding: z.enum(GROUNDING),
    needsClarification: z.boolean(),
    clarifyingQuestion: z.string().max(500),
    safetyNote: z.string().max(500),
    actionProposal: z.object({
      actionType: z.enum(ACTION_TYPES),
      application: z.string().max(60),
      recipientLabel: z.string().max(120),
      amount: z.number().nonnegative().nullable(),
      currency: z.string().max(3).nullable(),
    }).nullable(),
  }),
};

const ELEMENT_TYPES = ['navigation', 'action', 'input', 'info', 'warn', 'danger'];
const SCREEN_RISK = ['SAFE', 'WARNING', 'HIGH_RISK', 'CRITICAL', 'UNKNOWN'];

// Models differ in small ways (0–1 or 0–1000 coordinates, a label that runs
// long). Normalise those instead of throwing a useful answer away.
const clipped = (n) => z.preprocess((v) => (v == null ? '' : String(v)), z.string()).transform((s) => s.trim().slice(0, n));
const percent = z.preprocess((v) => {
  const num = typeof v === 'string' ? Number.parseFloat(v) : v;
  if (typeof num !== 'number' || !Number.isFinite(num) || num < 0) return null;
  const pct = num <= 1 ? num * 100 : num <= 100 ? num : num <= 1000 ? num / 10 : null;
  return pct == null ? null : Math.min(100, Math.max(0, pct));
}, z.number().nullable());

export const screenAnalysis = {
  name: 'screen_analysis',
  jsonSchema: {
    type: 'object',
    additionalProperties: false,
    required: ['screenType', 'detectedApp', 'userGoal', 'risk', 'summary', 'nextAction', 'requiresConfirmation', 'warning', 'elements'],
    properties: {
      screenType: { type: 'string', description: 'e.g. home, chat, payment_confirmation, login, settings, message, unknown' },
      detectedApp: { type: 'string', description: 'App or website name if visible, else empty' },
      userGoal: { type: 'string', enum: INTENTS },
      risk: { type: 'string', enum: SCREEN_RISK },
      summary: { type: 'string', description: '2-3 calm sentences answering the user question.' },
      nextAction: { type: 'string', description: 'The single next safe step, or empty.' },
      requiresConfirmation: { type: 'boolean' },
      warning: { type: 'string', description: 'Why this may be unsafe, or empty.' },
      elements: {
        type: 'array',
        maxItems: 8,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['label', 'type', 'description', 'x', 'y', 'confidence', 'nextStep'],
          properties: {
            label: { type: 'string', description: 'The exact words or icon name on the element, e.g. "Send" or "Paperclip icon".' },
            type: { type: 'string', enum: ELEMENT_TYPES },
            description: { type: 'string' },
            x: { type: ['number', 'null'], description: 'Horizontal centre as % of width (0-100), or null if unsure.' },
            y: { type: ['number', 'null'], description: 'Vertical centre as % of height (0-100), or null if unsure.' },
            confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
            nextStep: { type: 'boolean', description: 'true only for the element the user should press next.' },
          },
        },
      },
    },
  },
  zodSchema: z.object({
    screenType: z.string().max(60),
    detectedApp: z.string().max(80),
    userGoal: z.enum(INTENTS),
    risk: z.enum(SCREEN_RISK),
    summary: clipped(1500),
    nextAction: clipped(500),
    requiresConfirmation: z.preprocess((v) => v === true || v === 'true', z.boolean()),
    warning: clipped(500),
    elements: z.array(z.object({
      label: clipped(80),
      type: z.preprocess((v) => (ELEMENT_TYPES.includes(v) ? v : 'info'), z.enum(ELEMENT_TYPES)),
      description: clipped(400),
      x: percent,
      y: percent,
      confidence: z.preprocess((v) => (['high', 'medium', 'low'].includes(v) ? v : 'medium'), z.enum(['high', 'medium', 'low'])),
      nextStep: z.preprocess((v) => v === true || v === 'true', z.boolean()),
    })).transform((list) => list.slice(0, 8)),
  }),
};

export const safetyInterpretation = {
  name: 'safety_interpretation',
  jsonSchema: {
    type: 'object',
    additionalProperties: false,
    required: ['severity', 'explanation', 'reasons'],
    properties: {
      severity: { type: 'string', enum: ['SAFE', 'WARNING', 'HIGH_RISK', 'CRITICAL', 'UNKNOWN'] },
      explanation: { type: 'string', description: '2-3 plain sentences in the user language.' },
      reasons: { type: 'array', items: { type: 'string' }, maxItems: 5 },
    },
  },
  zodSchema: z.object({
    severity: z.enum(['SAFE', 'WARNING', 'HIGH_RISK', 'CRITICAL', 'UNKNOWN']),
    explanation: z.string().max(1200),
    reasons: z.array(z.string().max(300)).max(5),
  }),
};
