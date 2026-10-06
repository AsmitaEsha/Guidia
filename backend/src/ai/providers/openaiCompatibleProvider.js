import OpenAI from 'openai';
import { env } from '../../config/env.js';

// Chat-completions provider for any OpenAI-compatible endpoint. Used for:
//   - Google Gemini (free tier):  https://generativelanguage.googleapis.com/v1beta/openai/
//   - Ollama (free, local):       http://localhost:11434/v1
// Neither offers speech here, so voice falls back to the browser.

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

export function createOpenAICompatibleProvider({ name, baseUrl, apiKey, model, visionModel, fallbackModel, timeoutMs, isAvailable }) {
  let client = null;
  const getClient = () => {
    if (!client) client = new OpenAI({ apiKey: apiKey || 'not-needed', baseURL: baseUrl, timeout: timeoutMs, maxRetries: env.ai.maxRetries });
    return client;
  };

  // Ask for schema-constrained JSON first; if the endpoint or model rejects
  // json_schema (some do), retry with plain JSON mode plus the schema in
  // the prompt. The gateway validates the result with zod either way.
  async function completeJson({ system, messages, name: schemaName, jsonSchema, model: m }) {
    try {
      const r = await getClient().chat.completions.create({
        model: m,
        messages: messagesFor(system, messages),
        response_format: { type: 'json_schema', json_schema: { name: schemaName, schema: jsonSchema, strict: true } },
      });
      return { raw: r.choices[0]?.message?.content ?? '', model: m, ...usage(r) };
    } catch (err) {
      if (err?.status !== 400 && err?.status !== 422) throw err;
      const r = await getClient().chat.completions.create({
        model: m,
        messages: messagesFor(system + schemaHint(jsonSchema), messages),
        response_format: { type: 'json_object' },
      });
      return { raw: r.choices[0]?.message?.content ?? '', model: m, ...usage(r) };
    }
  }

  // Run fn with the main model; if it's busy or gone, try fallbackModel once.
  async function withModelFallback(m, fn) {
    try {
      return await fn(m);
    } catch (err) {
      if (!fallbackModel || fallbackModel === m || !MODEL_SWITCH_STATUSES.has(err?.status)) throw err;
      return fn(fallbackModel);
    }
  }

  return {
    name,
    supportsVoice: false,
    isAvailable,

    text({ system, messages }) {
      return withModelFallback(model, async (m) => {
        const r = await getClient().chat.completions.create({ model: m, messages: messagesFor(system, messages) });
        return { text: r.choices[0]?.message?.content ?? '', model: m, ...usage(r) };
      });
    },

    structured({ system, messages, name: schemaName, jsonSchema }) {
      return withModelFallback(model, (m) => completeJson({ system, messages, name: schemaName, jsonSchema, model: m }));
    },

    vision({ system, prompt, imageBase64, mimeType, name: schemaName, jsonSchema }) {
      const messages = [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          { type: 'text', text: prompt },
        ],
      }];
      return withModelFallback(visionModel, (m) => completeJson({ system, messages, name: schemaName, jsonSchema, model: m }));
    },
  };
}

export const geminiProvider = createOpenAICompatibleProvider({
  name: 'gemini',
  baseUrl: env.ai.gemini.baseUrl,
  apiKey: env.ai.gemini.apiKey,
  model: env.ai.gemini.model,
  visionModel: env.ai.gemini.model,
  fallbackModel: env.ai.gemini.fallbackModel,
  timeoutMs: env.ai.timeoutMs,
  isAvailable: () => Boolean(env.ai.gemini.apiKey),
});

// Local models are slower (especially reading images on a CPU), so Ollama
// gets a longer timeout. Availability means "configured"; if Ollama isn't
// running, calls fail fast and the UI shows an honest error.
export const ollamaProvider = createOpenAICompatibleProvider({
  name: 'ollama',
  baseUrl: env.ai.ollama.baseUrl,
  apiKey: 'ollama',
  model: env.ai.ollama.model,
  visionModel: env.ai.ollama.visionModel,
  timeoutMs: Math.max(env.ai.timeoutMs, 120_000),
  isAvailable: () => env.ai.provider === 'ollama' || env.ai.fallbackProvider === 'ollama',
});
