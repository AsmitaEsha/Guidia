import { env } from '../config/env.js';
import { classifyIntentDeterministic } from '../ai/intents.js';
import { logger } from '../lib/logger.js';

// HTTP client for the Python ML service (Hugging Face models). Every call
// has a hard timeout and a deterministic fallback; fallbacks are reported
// as `degraded: true` with `confidence: null` — never an invented number.

async function post(path, body, requestId) {
  if (!env.ml.url) return null;
  try {
    const res = await fetch(`${env.ml.url}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(requestId ? { 'X-Request-Id': requestId } : {}) },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(env.ml.timeoutMs),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    logger.debug('ml-service call failed', { path, err: err?.name });
    return null;
  }
}

export const mlClient = {
  async health() {
    if (!env.ml.url) return { status: 'not_configured' };
    try {
      const res = await fetch(`${env.ml.url}/health`, { signal: AbortSignal.timeout(1500) });
      if (!res.ok) return { status: 'down' };
      const data = await res.json();
      return { status: data.models?.intent?.loaded ? 'up' : 'up_no_models', models: data.models };
    } catch {
      return { status: 'down' };
    }
  },

  /**
   * @returns {Promise<{ intent: string, confidence: number|null, source: string, degraded: boolean, modelVersion?: string, band: 'high'|'medium'|'low'|'unscored' }>}
   */
  async classifyIntent(text, { requestId } = {}) {
    const remote = env.features.hfIntent ? await post('/intent', { text }, requestId) : null;
    if (remote && remote.model_loaded && typeof remote.confidence === 'number') {
      const band = remote.confidence >= env.ml.intentHigh ? 'high' : remote.confidence >= env.ml.intentLow ? 'medium' : 'low';
      return {
        intent: band === 'low' ? 'UNKNOWN' : remote.intent,
        rawIntent: remote.intent,
        confidence: remote.confidence,
        source: 'hf',
        modelVersion: remote.model_version,
        degraded: false,
        band,
      };
    }
    return { ...classifyIntentDeterministic(text), band: 'unscored' };
  },

  /** @returns {Promise<{ label: string, confidence: number, modelVersion: string } | null>} */
  async classifySafety(text, { requestId } = {}) {
    if (!env.features.hfSafety) return null;
    const remote = await post('/safety', { text }, requestId);
    if (remote && remote.model_loaded && typeof remote.confidence === 'number') {
      return { label: remote.label, confidence: remote.confidence, modelVersion: remote.model_version };
    }
    return null;
  },
};
