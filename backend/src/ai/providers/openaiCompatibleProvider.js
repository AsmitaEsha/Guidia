import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';

// Chat-completions provider for any OpenAI-compatible endpoint. Used for
// the free providers Guidia chains together:
//   - Google Gemini (free tier):  https://generativelanguage.googleapis.com/v1beta/openai/
//   - Groq (free tier):           https://api.groq.com/openai/v1
//   - OpenRouter (":free" models): https://openrouter.ai/api/v1
//   - Ollama (free, local):       http://localhost:11434/v1
// Each provider can hold several keys. When a key hits its limit (429) or
// is refused (401/403), it rests and the next key answers. None of these
// offer speech here; voice is handled by ai/speech.js.

function messagesFor(system, messages) {
  return [{ role: 'system', content: system }, ...messages.map((m) => ({ role: m.role, content: m.content }))];
}

function usage(r) {
  return { inputTokens: r.usage?.prompt_tokens ?? null, outputTokens: r.usage?.completion_tokens ?? null };
}

function schemaHint(jsonSchema) {
  return `\n\nReply with ONLY one JSON object (no markdown, no extra text) that matches this JSON Schema exactly:\n${JSON.stringify(jsonSchema)}`;
}

// Busy (503), rate-limited (429) or retired (404): worth trying a sibling model.
const MODEL_SWITCH_STATUSES = new Set([404, 429, 503]);
// Out of quota or refused: worth trying the next key.
const KEY_SWITCH_STATUSES = new Set([401, 402, 403, 429]);
const KEY_REST_MS = { 429: 10 * 60_000, 402: 60 * 60_000, 401: 6 * 60 * 60_000, 403: 6 * 60 * 60_000 };

export function createOpenAICompatibleProvider({ name, baseUrl, apiKeys = [], keyless = false, model, visionModel, fallbackModel, timeoutMs, maxRetries = env.ai.maxRetries, isAvailable, headers }) {
  const clients = new Map();
  const restUntil = new Map(); // key → time it may be used again
  const keys = () => (keyless ? ['not-needed'] : apiKeys().filter(Boolean));

  const clientFor = (key) => {
    if (!clients.has(key)) {
      clients.set(key, new OpenAI({ apiKey: key, baseURL: baseUrl, timeout: timeoutMs, maxRetries, defaultHeaders: headers }));
    }
    return clients.get(key);
  };

  // Runs fn(client) with the first rested key; rotates on quota errors.
  async function withKey(fn) {
    const all = keys();
    const ready = all.filter((k) => (restUntil.get(k) ?? 0) <= Date.now());
    const order = ready.length ? ready : all; // all resting: try anyway, limits may have reset
    let lastErr;
    for (const key of order) {
      try {
        return await fn(clientFor(key));
      } catch (err) {
        lastErr = err;
        if (!KEY_SWITCH_STATUSES.has(err?.status) || order.length === 1) throw err;
        restUntil.set(key, Date.now() + (KEY_REST_MS[err.status] ?? 60_000));
        logger.warn('AI key limited, trying the next one', { provider: name, status: err.status, keysLeft: order.length - order.indexOf(key) - 1 });
      }
    }
    throw lastErr;
  }

  // Ask for schema-constrained JSON first; if the endpoint or model rejects
  // json_schema (some do), retry with plain JSON mode plus the schema in
  // the prompt. The gateway validates the result with zod either way.
  async function completeJson(client, { system, messages, name: schemaName, jsonSchema, model: m }) {
    try {
      const r = await client.chat.completions.create({
        model: m,
        messages: messagesFor(system, messages),
        response_format: { type: 'json_schema', json_schema: { name: schemaName, schema: jsonSchema, strict: true } },
      });
      return { raw: r.choices[0]?.message?.content ?? '', model: m, ...usage(r) };
    } catch (err) {
      if (err?.status !== 400 && err?.status !== 422) throw err;
      const r = await client.chat.completions.create({
        model: m,
        messages: messagesFor(system + schemaHint(jsonSchema), messages),
        response_format: { type: 'json_object' },
      });
      return { raw: r.choices[0]?.message?.content ?? '', model: m, ...usage(r) };
    }
  }

  // Run fn with the main model; if it's busy or gone, try fallbackModel once.
  // A model that ran out of quota rests for a while, so later calls go
  // straight to the fallback instead of waiting on the same refusal.
  const modelRestUntil = new Map();
  async function withModelFallback(m, fn) {
    const canSwitch = fallbackModel && fallbackModel !== m;
    if (canSwitch && (modelRestUntil.get(m) ?? 0) > Date.now()) {
      try {
        return await withKey((client) => fn(client, fallbackModel));
      } catch (err) {
        if (!MODEL_SWITCH_STATUSES.has(err?.status)) throw err;
        // The fallback is limited too: give the main model another chance.
      }
    }
    try {
      return await withKey((client) => fn(client, m));
    } catch (err) {
      if (!canSwitch || !MODEL_SWITCH_STATUSES.has(err?.status)) throw err;
      modelRestUntil.set(m, Date.now() + (KEY_REST_MS[err.status] ?? 60_000));
      return withKey((client) => fn(client, fallbackModel));
    }
  }

  return {
    name,
    supportsVoice: false,
    isAvailable: () => isAvailable() && keys().length > 0,

    text({ system, messages }) {
      return withModelFallback(model, async (client, m) => {
        const r = await client.chat.completions.create({ model: m, messages: messagesFor(system, messages) });
        return { text: r.choices[0]?.message?.content ?? '', model: m, ...usage(r) };
      });
    },

    structured({ system, messages, name: schemaName, jsonSchema }) {
      return withModelFallback(model, (client, m) => completeJson(client, { system, messages, name: schemaName, jsonSchema, model: m }));
    },

    vision({ system, prompt, imageBase64, mimeType, name: schemaName, jsonSchema }) {
      const messages = [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          { type: 'text', text: prompt },
        ],
      }];
      return withModelFallback(visionModel, (client, m) => completeJson(client, { system, messages, name: schemaName, jsonSchema, model: m }));
    },
  };
}

export const geminiProvider = createOpenAICompatibleProvider({
  name: 'gemini',
  baseUrl: env.ai.gemini.baseUrl,
  apiKeys: () => env.ai.gemini.apiKeys,
  model: env.ai.gemini.model,
  visionModel: env.ai.gemini.model,
  fallbackModel: env.ai.gemini.fallbackModel,
  timeoutMs: env.ai.timeoutMs,
  isAvailable: () => true,
});

export const groqProvider = createOpenAICompatibleProvider({
  name: 'groq',
  baseUrl: env.ai.groq.baseUrl,
  apiKeys: () => env.ai.groq.apiKeys,
  model: env.ai.groq.model,
  visionModel: env.ai.groq.visionModel,
  timeoutMs: env.ai.timeoutMs,
  isAvailable: () => true,
});

export const openrouterProvider = createOpenAICompatibleProvider({
  name: 'openrouter',
  baseUrl: env.ai.openrouter.baseUrl,
  apiKeys: () => env.ai.openrouter.apiKeys,
  model: env.ai.openrouter.model,
  visionModel: env.ai.openrouter.visionModel,
  timeoutMs: Math.max(env.ai.timeoutMs, 60_000),
  isAvailable: () => true,
  headers: { 'HTTP-Referer': env.appUrl, 'X-Title': 'Guidia' },
});

// Local models are slower (especially reading images on a CPU), so Ollama
// gets its own timeout (OLLAMA_TIMEOUT_MS) and no retries, so a slow
// computer can't leave someone waiting for minutes. Availability means "listed in the chain"; if
// Ollama isn't running, calls fail fast and the next provider (or an honest
// error) takes over.
export const ollamaProvider = createOpenAICompatibleProvider({
  name: 'ollama',
  baseUrl: env.ai.ollama.baseUrl,
  keyless: true,
  model: env.ai.ollama.model,
  visionModel: env.ai.ollama.visionModel,
  timeoutMs: env.ai.ollama.timeoutMs,
  maxRetries: 0,
  isAvailable: () => env.ai.chain.includes('ollama'),
});
