import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { ApiError } from '../middleware/errorHandler.js';

// Single provider-agnostic entry point for every AI feature (assistant,
// screenshot understanding, scam-detection interpretation, ...). Nothing
// outside this file may import an AI SDK or reference GEMINI_API_KEY — that
// keeps the provider swappable via env vars alone (AI_PROVIDER/GEMINI_MODEL)
// and keeps API keys strictly server-side (never VITE_-prefixed, never sent
// to the browser).

let client = null;

function getClient() {
  if (env.aiProvider !== 'gemini') {
    throw new ApiError(501, 'That AI provider is not supported yet.', 'AI_PROVIDER_UNSUPPORTED');
  }
  if (!env.geminiApiKey) {
    throw new ApiError(
      503,
      "AI features aren't set up yet. An administrator needs to add a GEMINI_API_KEY.",
      'AI_NOT_CONFIGURED'
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: env.geminiApiKey });
  }
  return client;
}

export const aiGateway = {
  // Returns { available: boolean } without making a network call — lets
  // callers degrade gracefully (e.g. show a "not configured" state) instead
  // of throwing mid-flow.
  isAvailable() {
    return env.aiProvider === 'gemini' && Boolean(env.geminiApiKey);
  },

  async generateText({ prompt, systemInstruction }) {
    const ai = getClient();
    try {
      const response = await ai.models.generateContent({
        model: env.geminiModel,
        contents: prompt,
        ...(systemInstruction ? { config: { systemInstruction } } : {}),
      });
      return response.text;
    } catch (err) {
      throw new ApiError(502, "Guidia's AI assistant is temporarily unavailable. Please try again in a moment.", 'AI_UPSTREAM_ERROR');
    }
  },

  // imageBase64: raw base64 (no data: prefix). mimeType e.g. 'image/png'.
  async analyzeImage({ imageBase64, mimeType, prompt, systemInstruction }) {
    const ai = getClient();
    try {
      const response = await ai.models.generateContent({
        model: env.geminiModel,
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType, data: imageBase64 } },
              { text: prompt },
            ],
          },
        ],
        ...(systemInstruction ? { config: { systemInstruction } } : {}),
      });
      return response.text;
    } catch (err) {
      throw new ApiError(502, "Guidia's AI assistant is temporarily unavailable. Please try again in a moment.", 'AI_UPSTREAM_ERROR');
    }
  },
};
