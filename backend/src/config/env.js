import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

// Always load backend/.env regardless of the working directory the
// process was started from. Real environment variables take precedence.
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });

// Validated, typed configuration. Anything secret is read here and nowhere
// else. In production a missing core secret stops startup; optional
// integrations (xAI, SMTP, ML service) degrade to an honest "unavailable"
// state and are reported by GET /api/health/ready instead.

const bool = (fallback) =>
  z.preprocess((v) => (v === undefined || v === '' ? fallback : String(v).toLowerCase() === 'true'), z.boolean());
const int = (fallback) =>
  z.preprocess((v) => (v === undefined || v === '' ? fallback : Number(v)), z.number().int());
const num = (fallback) =>
  z.preprocess((v) => (v === undefined || v === '' ? fallback : Number(v)), z.number());
const list = () =>
  z.preprocess((v) => String(v ?? '').split(',').map((s) => s.trim()).filter(Boolean), z.array(z.string()));

const PROVIDER_NAMES = ['gemini', 'groq', 'openrouter', 'ollama', 'xai', 'mock', 'none'];
// Comma-separated values: "a, b,,c" → ['a', 'b', 'c'].
const csv = (v) => String(v || '').split(',').map((x) => x.trim()).filter(Boolean);
const nodeEnv = process.env.NODE_ENV || 'development';
const isTest = nodeEnv === 'test';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: int(8000),
  CORS_ORIGIN: list(),
  APP_URL: z.string().default('http://localhost:5173'),
  ALLOWED_EXTENSION_IDS: list(),
  COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),

  DATABASE_URL: isTest ? z.string().default('postgresql://test@localhost/test') : z.string().min(1),

  JWT_ACCESS_SECRET: isTest ? z.string().default('test-secret') : z.string().min(16),
  JWT_REFRESH_SECRET: isTest ? z.string().default('test-refresh-secret') : z.string().min(16),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),

  // gemini (free tier) · ollama (free, local) · xai (paid) · mock (tests).
  // Unknown values map to "none": AI shows as unavailable instead of
  // crashing startup.
  AI_PROVIDER: z.preprocess((v) => (PROVIDER_NAMES.includes(v) ? v : v === undefined || v === '' ? 'gemini' : 'none'), z.enum(PROVIDER_NAMES)),
  // Used automatically when the main provider fails or hits its limit.
  AI_FALLBACK_PROVIDER: z.preprocess((v) => (PROVIDER_NAMES.includes(v) ? v : 'none'), z.enum(PROVIDER_NAMES)),
  // Ordered list of providers to try, e.g. "gemini,groq,openrouter,ollama".
  // When one runs out of free quota the next answers. Empty = AI_PROVIDER
  // then AI_FALLBACK_PROVIDER.
  AI_CHAIN: z.string().default(''),
  GEMINI_API_KEY: z.string().default(''),
  // More free Gemini keys (from different Google accounts), comma separated.
  // Guidia rotates to the next key when one hits its daily limit.
  GEMINI_API_KEYS: z.string().default(''),
  GROQ_API_KEYS: z.string().default(''),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
  GROQ_VISION_MODEL: z.string().default('meta-llama/llama-4-scout-17b-16e-instruct'),
  GROQ_BASE_URL: z.string().default('https://api.groq.com/openai/v1'),
  OPENROUTER_API_KEYS: z.string().default(''),
  OPENROUTER_MODEL: z.string().default('meta-llama/llama-3.3-70b-instruct:free'),
  OPENROUTER_VISION_MODEL: z.string().default('google/gemma-3-27b-it:free'),
  OPENROUTER_BASE_URL: z.string().default('https://openrouter.ai/api/v1'),
  GEMINI_MODEL: z.string().default('gemini-flash-latest'),
  // Tried when the main model is busy (503), rate-limited (429) or retired (404).
  GEMINI_FALLBACK_MODEL: z.string().default('gemini-flash-lite-latest'),
  GEMINI_BASE_URL: z.string().default('https://generativelanguage.googleapis.com/v1beta/openai/'),
  GEMINI_TTS_MODEL: z.string().default('gemini-2.5-flash-preview-tts'),
  GEMINI_TTS_VOICE: z.string().default('Kore'),
  // Spoken guidance: edge (free neural voices, default) · gemini · off
  SPEECH_PROVIDER: z.enum(['edge', 'gemini', 'off']).default('edge'),
  SPEECH_VOICE_BN: z.string().default('bn-IN-TanishaaNeural'),
  SPEECH_VOICE_HI: z.string().default('hi-IN-MadhurNeural'),
  SPEECH_VOICE_VI: z.string().default('vi-VN-HoaiMyNeural'),
  SPEECH_VOICE_EN: z.string().default('en-US-AvaNeural'),
  OLLAMA_BASE_URL: z.string().default('http://localhost:11434/v1'),
  OLLAMA_MODEL: z.string().default('gemma3:4b'),
  OLLAMA_VISION_MODEL: z.string().default(''),
  OLLAMA_TIMEOUT_MS: int(45000),
  XAI_API_KEY: z.string().default(''),
  XAI_BASE_URL: z.string().default('https://api.x.ai/v1'),
  XAI_MODEL: z.string().default('grok-4.7'),
  XAI_VISION_MODEL: z.string().default(''),
  XAI_TTS_VOICE: z.string().default(''),
  AI_TIMEOUT_MS: int(30000),
  AI_MAX_RETRIES: int(0),

  ML_SERVICE_URL: z.string().default(''),
  ML_TIMEOUT_MS: int(3000),
  INTENT_HIGH_CONFIDENCE_THRESHOLD: num(0.85),
  INTENT_LOW_CONFIDENCE_THRESHOLD: num(0.5),

  SMTP_HOST: z.string().default(''),
  SMTP_PORT: int(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASSWORD: z.string().default(''),
  SMTP_FROM: z.string().default('Guidia <no-reply@example.com>'),

  FEATURE_GROK_VISION: bool(true),
  FEATURE_HF_INTENT: bool(true),
  FEATURE_HF_SAFETY: bool(true),
  FEATURE_RAG: bool(true),
  FEATURE_REALTIME_VOICE: bool(false),
  FEATURE_GUARDIAN_APPROVAL: bool(true),
  FEATURE_BROWSER_EXTENSION: bool(true),
  FEATURE_DEMO_MODE: bool(true),

  DISABLE_AI_CHAT: bool(false),
  DISABLE_AI_VISION: bool(false),
  DISABLE_VOICE: bool(false),
  DISABLE_SENSITIVE_ACTIONS: bool(false),

  WORKER_ENABLED: bool(!isTest),
  WORKER_INTERVAL_MS: int(5000),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Invalid environment configuration:\n${issues}`);
}
const e = parsed.data;

if (e.NODE_ENV === 'production') {
  const weak = ['replace-with-a-long-random-string', 'replace-with-a-different-long-random-string'];
  if (weak.includes(e.JWT_ACCESS_SECRET) || weak.includes(e.JWT_REFRESH_SECRET)) {
    throw new Error('JWT secrets are still the .env.example placeholders. Generate real secrets before running in production.');
  }
}

export const env = {
  nodeEnv: e.NODE_ENV,
  isProduction: e.NODE_ENV === 'production',
  isTest: e.NODE_ENV === 'test',
  port: e.PORT,
  corsOrigins: e.CORS_ORIGIN.length ? e.CORS_ORIGIN : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  appUrl: e.APP_URL.replace(/\/$/, ''),
  allowedExtensionIds: e.ALLOWED_EXTENSION_IDS,
  cookieSameSite: e.COOKIE_SAMESITE,
  databaseUrl: e.DATABASE_URL,

  jwtAccessSecret: e.JWT_ACCESS_SECRET,
  jwtRefreshSecret: e.JWT_REFRESH_SECRET,
  jwtAccessTtl: e.JWT_ACCESS_TTL,
  jwtRefreshTtl: e.JWT_REFRESH_TTL,

  speech: {
    provider: e.SPEECH_PROVIDER,
    voices: { bn: e.SPEECH_VOICE_BN, hi: e.SPEECH_VOICE_HI, vi: e.SPEECH_VOICE_VI, en: e.SPEECH_VOICE_EN },
  },
  ai: {
    provider: e.AI_PROVIDER,
    fallbackProvider: e.AI_FALLBACK_PROVIDER === e.AI_PROVIDER ? 'none' : e.AI_FALLBACK_PROVIDER,
    chain: (() => {
      const listed = csv(e.AI_CHAIN).filter((n) => PROVIDER_NAMES.includes(n) && n !== 'none');
      const base = listed.length ? listed : [e.AI_PROVIDER, e.AI_FALLBACK_PROVIDER];
      return [...new Set(base.filter((n) => n && n !== 'none'))];
    })(),
    gemini: { apiKey: csv(e.GEMINI_API_KEY)[0] || csv(e.GEMINI_API_KEYS)[0] || '', apiKeys: [...new Set([...csv(e.GEMINI_API_KEY), ...csv(e.GEMINI_API_KEYS)])], model: e.GEMINI_MODEL, fallbackModel: e.GEMINI_FALLBACK_MODEL, baseUrl: e.GEMINI_BASE_URL, ttsModel: e.GEMINI_TTS_MODEL, ttsVoice: e.GEMINI_TTS_VOICE },
    groq: { apiKeys: csv(e.GROQ_API_KEYS), model: e.GROQ_MODEL, visionModel: e.GROQ_VISION_MODEL, baseUrl: e.GROQ_BASE_URL },
    openrouter: { apiKeys: csv(e.OPENROUTER_API_KEYS), model: e.OPENROUTER_MODEL, visionModel: e.OPENROUTER_VISION_MODEL, baseUrl: e.OPENROUTER_BASE_URL },
    ollama: { baseUrl: e.OLLAMA_BASE_URL, model: e.OLLAMA_MODEL, visionModel: e.OLLAMA_VISION_MODEL || e.OLLAMA_MODEL, timeoutMs: e.OLLAMA_TIMEOUT_MS },
    apiKey: e.XAI_API_KEY,
    baseUrl: e.XAI_BASE_URL,
    model: e.XAI_MODEL,
    visionModel: e.XAI_VISION_MODEL || e.XAI_MODEL,
    ttsVoice: e.XAI_TTS_VOICE,
    timeoutMs: e.AI_TIMEOUT_MS,
    maxRetries: e.AI_MAX_RETRIES,
  },

  ml: {
    url: e.ML_SERVICE_URL.replace(/\/$/, ''),
    timeoutMs: e.ML_TIMEOUT_MS,
    intentHigh: e.INTENT_HIGH_CONFIDENCE_THRESHOLD,
    intentLow: e.INTENT_LOW_CONFIDENCE_THRESHOLD,
  },

  smtp: {
    host: e.SMTP_HOST,
    port: e.SMTP_PORT,
    user: e.SMTP_USER,
    password: e.SMTP_PASSWORD,
    from: e.SMTP_FROM,
  },

  features: {
    grokVision: e.FEATURE_GROK_VISION,
    hfIntent: e.FEATURE_HF_INTENT,
    hfSafety: e.FEATURE_HF_SAFETY,
    rag: e.FEATURE_RAG,
    realtimeVoice: e.FEATURE_REALTIME_VOICE,
    guardianApproval: e.FEATURE_GUARDIAN_APPROVAL,
    browserExtension: e.FEATURE_BROWSER_EXTENSION,
    demoMode: e.FEATURE_DEMO_MODE,
  },

  killSwitches: {
    aiChat: e.DISABLE_AI_CHAT,
    aiVision: e.DISABLE_AI_VISION,
    voice: e.DISABLE_VOICE,
    sensitiveActions: e.DISABLE_SENSITIVE_ACTIONS,
  },

  worker: {
    enabled: e.WORKER_ENABLED,
    intervalMs: e.WORKER_INTERVAL_MS,
  },
};
