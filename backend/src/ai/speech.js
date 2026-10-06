import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { env } from '../config/env.js';
import { ApiError } from '../middleware/errorHandler.js';
import { logger } from '../lib/logger.js';
import { aiGateway } from './gateway.js';

// Spoken guidance ("read it to me"). Engines, in order:
//   1. the AI provider's own voice (xAI), when configured
//   2. free neural voices (the Microsoft Edge "Read aloud" voices) — no
//      key, no quota, natural Bengali, Hindi, Vietnamese and English
//   3. Gemini text-to-speech (free tier, only ~10 clips a day) as a backup
//   4. otherwise 503, and the app falls back to the device voice or text.
//
// Every clip is cached on disk, so repeated lesson steps and buttons play
// instantly and never depend on the network twice.

const CACHE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.tts-cache');
const CACHE_MAX_FILES = 3000;
const EDGE_TIMEOUT_MS = 30_000;
const GEMINI_TIMEOUT_MS = 45_000;
let geminiCoolDownUntil = 0; // after a quota/rate error, skip Gemini until it allows us again

const EDGE_VOICES = () => ({
  bn: env.speech.voices.bn,
  hi: env.speech.voices.hi,
  vi: env.speech.voices.vi,
  en: env.speech.voices.en,
});

// Pick the voice from the words themselves, so a sentence that only exists
// in English is read by an English voice even when the app is in Hindi, and
// Bengali text is never read by a Hindi voice.
const VI_MARKS = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
export function spokenLanguage(text, fallback = 'en') {
  const bn = (text.match(/[ঀ-৿]/g) || []).length;
  const hi = (text.match(/[ऀ-ॿ]/g) || []).length;
  if (bn || hi) return bn >= hi ? 'bn' : 'hi';
  if (VI_MARKS.test(text)) return 'vi';
  if (/[a-z]/i.test(text)) return fallback === 'vi' ? 'vi' : 'en';
  return fallback;
}

// 0.8 → "-20%", 1.15 → "+15%"
const edgeRate = (speed) => `${speed >= 1 ? '+' : ''}${Math.round((speed - 1) * 100)}%`;

async function edgeOnce({ text, language, speed }) {
  const tts = new MsEdgeTTS();
  let timer;
  try {
    const work = (async () => {
      await tts.setMetadata(EDGE_VOICES()[language] || EDGE_VOICES().en, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const { audioStream } = tts.toStream(text, { rate: edgeRate(speed) });
      const parts = [];
      for await (const chunk of audioStream) parts.push(chunk);
      return Buffer.concat(parts);
    })();
    const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Edge speech timed out')), EDGE_TIMEOUT_MS); });
    const audio = await Promise.race([work, timeout]);
    if (!audio.length) throw new Error('Edge speech returned no audio');
    return { audio, mimeType: 'audio/mpeg', ext: 'mp3' };
  } finally {
    clearTimeout(timer);
    try { tts.close(); } catch { /* already closed */ }
  }
}

function wavFromPcm(pcm, sampleRate = 24_000, channels = 1, bits = 16) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE((sampleRate * channels * bits) / 8, 28);
  header.writeUInt16LE((channels * bits) / 8, 32);
  header.writeUInt16LE(bits, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

// A short style line keeps the voice warm and the pace right.
function styled(text, speed) {
  const pace = speed <= 0.9 ? 'slowly, calmly and clearly' : speed >= 1.1 ? 'clearly, at a brisk pace' : 'clearly, in a warm and friendly way';
  return `Read this aloud ${pace}: ${text}`;
}

async function geminiSpeech({ text, speed }) {
  if (!env.ai.gemini.apiKey || Date.now() < geminiCoolDownUntil) throw new Error('Gemini speech unavailable');
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${env.ai.gemini.ttsModel}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.ai.gemini.apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: styled(text, speed) }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: env.ai.gemini.ttsVoice } } },
      },
    }),
    signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
  });
  if (!res.ok) {
    if (res.status === 429 || res.status === 503) {
      // Honour Gemini's own retry time (the free daily quota can be hours away).
      const body = await res.json().catch(() => null);
      const retry = body?.error?.details?.find((d) => d.retryDelay)?.retryDelay;
      const seconds = Number.parseFloat(retry) || 60;
      geminiCoolDownUntil = Date.now() + Math.min(seconds, 24 * 3600) * 1000;
    }
    throw new Error(`Gemini speech failed (${res.status})`);
  }
  const json = await res.json();
  const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData;
  if (!part) throw new Error('Gemini speech returned no audio');
  const rate = Number(/rate=(\d+)/.exec(part.mimeType || '')?.[1]) || 24_000;
  return { audio: wavFromPcm(Buffer.from(part.data, 'base64'), rate), mimeType: 'audio/wav', ext: 'wav' };
}

// The free voice service occasionally drops a connection; one fresh retry
// fixes almost every failure.
async function edgeSpeech(args) {
  try {
    return await edgeOnce(args);
  } catch (err) {
    logger.warn('Free voice failed once, retrying', { message: err.message });
    return edgeOnce(args);
  }
}

const MIME = { mp3: 'audio/mpeg', wav: 'audio/wav' };

async function readCache(key) {
  for (const ext of ['mp3', 'wav']) {
    try { return { audio: await fs.readFile(path.join(CACHE_DIR, `${key}.${ext}`)), mimeType: MIME[ext] }; } catch { /* not cached */ }
  }
  return null;
}

async function writeCache(key, { audio, ext }) {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(path.join(CACHE_DIR, `${key}.${ext}`), audio);
    const files = await fs.readdir(CACHE_DIR);
    if (files.length > CACHE_MAX_FILES) {
      const stats = await Promise.all(files.map(async (f) => ({ f, t: (await fs.stat(path.join(CACHE_DIR, f))).mtimeMs })));
      stats.sort((a, b) => a.t - b.t).slice(0, files.length - CACHE_MAX_FILES).forEach(({ f }) => fs.rm(path.join(CACHE_DIR, f), { force: true }));
    }
  } catch (err) {
    logger.warn('Could not cache speech', { message: err.message });
  }
}

const ENGINES = { edge: edgeSpeech, gemini: geminiSpeech };

export const speechService = {
  /** The engine that will speak first, or null when the server has no voice. */
  engine() {
    if (env.killSwitches.voice) return null;
    if (aiGateway.supportsVoice()) return 'provider';
    return this.order()[0] || null;
  },

  /** Free engines to try, in order (SPEECH_PROVIDER picks the first). */
  order() {
    const all = ['edge', 'gemini'].filter((e) => e !== 'gemini' || env.ai.gemini.apiKey);
    if (env.speech.provider === 'off') return [];
    if (env.speech.provider === 'gemini') return ['gemini', ...all.filter((e) => e !== 'gemini')];
    return all;
  },

  available() {
    return this.engine() !== null;
  },

  async synthesize({ text, language = 'en', locale, speed = 1, meta = {} }) {
    const engine = this.engine();
    if (!engine) throw new ApiError(503, 'Spoken answers are not available right now.', 'VOICE_UNAVAILABLE');
    if (engine === 'provider') return aiGateway.synthesizeSpeech({ text, language: locale, speed, meta });

    const lang = spokenLanguage(text, language);
    const rounded = Math.round(speed * 20) / 20;
    for (const name of this.order()) {
      const voice = name === 'edge' ? EDGE_VOICES()[lang] : env.ai.gemini.ttsVoice;
      const key = crypto.createHash('sha256').update(`${name}|${voice}|${lang}|${rounded}|${text}`).digest('hex').slice(0, 40);
      const cached = await readCache(key);
      if (cached) return { ...cached, cached: true, engine: name };
      try {
        const clip = await ENGINES[name]({ text, language: lang, speed: rounded });
        writeCache(key, clip);
        return { audio: clip.audio, mimeType: clip.mimeType, cached: false, engine: name };
      } catch (err) {
        logger.warn('Speech engine failed', { engine: name, message: err.message, requestId: meta.requestId });
      }
    }
    throw new ApiError(503, 'Spoken answers are not available right now.', 'VOICE_UNAVAILABLE');
  },
};
