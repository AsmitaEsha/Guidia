import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import { logger } from '../lib/logger.js';
import { xaiProvider } from './providers/xaiProvider.js';
import { mockProvider } from './providers/mockProvider.js';
import { geminiProvider, groqProvider, ollamaProvider, openrouterProvider } from './providers/openaiCompatibleProvider.js';

// Provider-neutral entry point for every AI feature. Business code never
// sees provider response formats: it gets text, a validated object, or
// audio. Keys stay server-side; nothing here is reachable from the browser.
//
// AI_CHAIN lists providers in order (default: AI_PROVIDER, then
// AI_FALLBACK_PROVIDER). Each is tried in turn when the one before it fails
// or runs out of free quota — e.g. Gemini's daily limit runs out, Groq
// answers, then OpenRouter, then local Ollama.

const PROVIDERS = { xai: xaiProvider, gemini: geminiProvider, groq: groqProvider, openrouter: openrouterProvider, ollama: ollamaProvider, mock: mockProvider };

function candidates({ voice = false } = {}) {
  return env.ai.chain
    .map((n) => PROVIDERS[n])
    .filter((p) => p && p.isAvailable() && (!voice || p.supportsVoice !== false));
}

const UNAVAILABLE = () =>
  new ApiError(503, "Guidia's AI helper isn't set up yet. You can still use lessons, practice and safety checks.", 'AI_NOT_CONFIGURED');
const VOICE_UNAVAILABLE = () =>
  new ApiError(503, "Guidia's own voice isn't available, so your device's voice will be used.", 'VOICE_UNAVAILABLE');
const UPSTREAM = () =>
  new ApiError(502, "Guidia's AI helper is not responding right now. Please try again in a moment.", 'AI_UPSTREAM_ERROR');
const BAD_OUTPUT = () =>
  new ApiError(502, "Guidia couldn't understand the AI's answer this time. Please try again.", 'AI_BAD_OUTPUT');

function logRequest(meta, providerName, startedAt, status, extra = {}) {
  prisma.aIRequestLog
    .create({
      data: {
        userId: meta.userId ?? null,
        requestId: meta.requestId ?? null,
        feature: meta.feature || 'unknown',
        provider: providerName,
        model: extra.model || 'unknown',
        status,
        latencyMs: Date.now() - startedAt,
        inputTokens: extra.inputTokens ?? null,
        outputTokens: extra.outputTokens ?? null,
        degraded: Boolean(meta.degraded || extra.fallback),
        errorCode: extra.errorCode ?? null,
      },
    })
    .catch(() => {});
}

// `validate` (optional) checks a provider's answer; if it can't be used,
// the next provider is asked instead of failing the whole request.
async function call(meta, fn, { voice = false, validate } = {}) {
  const list = candidates({ voice });
  if (!list.length) throw voice ? VOICE_UNAVAILABLE() : UNAVAILABLE();

  let badOutput = null;
  for (let i = 0; i < list.length; i += 1) {
    const p = list[i];
    const fallback = i > 0;
    const startedAt = Date.now();
    try {
      const result = await fn(p);
      const data = validate ? validate(result) : undefined;
      logRequest(meta, p.name, startedAt, 'ok', { ...result, fallback });
      return { ...result, ...(validate ? { data } : {}), provider: p.name, fallback };
    } catch (err) {
      if (err instanceof ApiError && err.code === 'AI_BAD_OUTPUT' && i + 1 < list.length) {
        badOutput = err;
        logRequest(meta, p.name, startedAt, 'error', { errorCode: err.code, fallback });
        logger.warn('AI answer unusable, asking the next provider', { provider: p.name, feature: meta.feature });
        continue;
      }
      if (err instanceof ApiError) {
        logRequest(meta, p.name, startedAt, 'error', { errorCode: err.code, fallback });
        throw err;
      }
      logRequest(meta, p.name, startedAt, 'error', { errorCode: String(err?.status || err?.code || 'UPSTREAM'), fallback });
      logger.warn('AI provider call failed', { provider: p.name, feature: meta.feature, status: err?.status, code: err?.code, requestId: meta.requestId, willFallback: i + 1 < list.length });
    }
  }
  throw badOutput || UPSTREAM();
}

function parseValidated(raw, zodSchema) {
  let data;
  try {
    data = JSON.parse(String(raw).trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, ''));
  } catch {
    throw BAD_OUTPUT();
  }
  const result = zodSchema.safeParse(data);
  if (!result.success) {
    logger.warn('AI output failed schema validation', { issues: result.error.issues.slice(0, 3).map((i) => i.path.join('.')) });
    throw BAD_OUTPUT();
  }
  return result.data;
}

export const aiGateway = {
  isAvailable() {
    return candidates().length > 0;
  },

  supportsVoice() {
    return candidates({ voice: true }).length > 0;
  },

  providerName() {
    return candidates()[0]?.name || 'none';
  },

  /** @returns {Promise<{ text: string, model: string }>} */
  generateText({ system, messages, meta = {} }) {
    return call(meta, (p) => p.text({ system, messages }));
  },

  /**
   * Structured output: the provider is constrained to `jsonSchema` and the
   * result is validated again with `zodSchema` — model output is untrusted.
   */
  async generateStructured({ system, messages, name, jsonSchema, zodSchema, meta = {} }) {
    const result = await call(meta, (p) => p.structured({ system, messages, name, jsonSchema }), { validate: (r) => parseValidated(r.raw, zodSchema) });
    return { data: result.data, model: result.model, provider: result.provider };
  },

  async analyzeImage({ system, prompt, imageBase64, mimeType, name, jsonSchema, zodSchema, meta = {} }) {
    const result = await call(meta, (p) => p.vision({ system, prompt, imageBase64, mimeType, name, jsonSchema }), { validate: (r) => parseValidated(r.raw, zodSchema) });
    return { data: result.data, model: result.model, provider: result.provider };
  },

  synthesizeSpeech({ text, voice, speed, language, meta = {} }) {
    return call(meta, (p) => p.speech({ text, voice, speed, language }), { voice: true });
  },

  transcribe({ buffer, mimeType, language, meta = {} }) {
    return call(meta, (p) => p.transcribe({ buffer, mimeType, language }), { voice: true });
  },
};
