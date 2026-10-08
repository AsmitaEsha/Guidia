import OpenAI, { toFile } from 'openai';
import { env } from '../../config/env.js';

// xAI (Grok) through its OpenAI-compatible API. This is the ONLY file that
// imports an AI SDK. Business code talks to ai/gateway.js, which talks to a
// provider object with this shape:
//   { name, isAvailable(), text(), structured(), vision(), speech(), transcribe() }
//
// `store: false` asks xAI not to retain request/response history.

let client = null;
function getClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: env.ai.apiKey,
      baseURL: env.ai.baseUrl,
      timeout: env.ai.timeoutMs,
      maxRetries: env.ai.maxRetries,
    });
  }
  return client;
}

function usage(response) {
  return { inputTokens: response.usage?.input_tokens ?? null, outputTokens: response.usage?.output_tokens ?? null };
}

function toInput(messages) {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}

export const xaiProvider = {
  name: 'xai',

  isAvailable() {
    return Boolean(env.ai.apiKey);
  },

  async text({ system, messages, model = env.ai.model, signal }) {
    const response = await getClient().responses.create(
      { model, instructions: system, input: toInput(messages), store: false },
      { signal },
    );
    return { text: response.output_text ?? '', model, ...usage(response) };
  },

  async structured({ system, messages, name, jsonSchema, model = env.ai.model, signal }) {
    const response = await getClient().responses.create(
      {
        model,
        instructions: system,
        input: toInput(messages),
        store: false,
        text: { format: { type: 'json_schema', name, schema: jsonSchema, strict: true } },
      },
      { signal },
    );
    return { raw: response.output_text ?? '', model, ...usage(response) };
  },

  async vision({ system, prompt, imageBase64, mimeType, name, jsonSchema, model = env.ai.visionModel, signal }) {
    const response = await getClient().responses.create(
      {
        model,
        instructions: system,
        store: false,
        input: [{
          role: 'user',
          content: [
            { type: 'input_image', image_url: `data:${mimeType};base64,${imageBase64}`, detail: 'high' },
            { type: 'input_text', text: prompt },
          ],
        }],
        text: { format: { type: 'json_schema', name, schema: jsonSchema, strict: true } },
      },
      { signal },
    );
    return { raw: response.output_text ?? '', model, ...usage(response) };
  },

  async speech({ text, voice, speed, language }) {
    const model = process.env.XAI_TTS_MODEL || 'grok-tts';
    const response = await getClient().audio.speech.create({
      model,
      voice: voice || env.ai.ttsVoice || 'default',
      input: text,
      speed,
      response_format: 'mp3',
      ...(language ? { language } : {}),
    });
    return { audio: Buffer.from(await response.arrayBuffer()), mimeType: 'audio/mpeg', model };
  },

  async transcribe({ buffer, mimeType, language }) {
    const model = process.env.XAI_STT_MODEL || 'grok-stt';
    const ext = mimeType.includes('webm') ? 'webm' : mimeType.includes('ogg') ? 'ogg' : mimeType.includes('wav') ? 'wav' : 'mp3';
    const result = await getClient().audio.transcriptions.create({
      model,
      file: await toFile(buffer, `speech.${ext}`, { type: mimeType }),
      ...(language ? { language } : {}),
    });
    return { text: result.text ?? '', model };
  },
};
