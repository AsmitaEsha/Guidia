import { z } from 'zod';
import { ApiError } from '../middleware/errorHandler.js';

const MAX_CHUNK = 180;
const LANG_MAP = { en: 'en', bn: 'bn', hi: 'hi' };

const speakSchema = z.object({
  text: z.string().trim().min(1).max(2000),
  lang: z.enum(['en', 'bn', 'hi']).optional(),
  speed: z.coerce.number().min(0.75).max(1.25).optional(),
  cognitiveState: z.enum(['CALM', 'UNSURE', 'SCARED']).optional(),
});

function cleanTextForSpeech(text) {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/https?:\/\/\S+/gi, ' link ')
    .replace(/[`*_#~|[\]{}]/g, ' ')
    .replace(/[•→⇒]/g, '. ')
    .replace(/\s*>\s*/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findChunkBoundary(text, max) {
  const slice = text.slice(0, max);
  const punctuation = ['।', '.', '!', '?', '…', ';', ','];
  const candidates = punctuation
    .map((mark) => slice.lastIndexOf(mark))
    .filter((idx) => idx > 35);

  if (candidates.length > 0) return Math.max(...candidates) + 1;

  const spaceIdx = text.lastIndexOf(' ', max);
  return spaceIdx > 0 ? spaceIdx : max;
}

function splitChunks(text) {
  const chunks = [];
  let rem = cleanTextForSpeech(text);

  while (rem.length > 0) {
    if (rem.length <= MAX_CHUNK) {
      chunks.push(rem);
      break;
    }

    const idx = findChunkBoundary(rem, MAX_CHUNK);
    chunks.push(rem.slice(0, idx).trim());
    rem = rem.slice(idx).trimStart();
  }

  return chunks;
}

// Proxies Google Translate's TTS endpoint server-side so voice playback
// works in production too, not just `npm run dev`. The route is public but
// rate-limited because Guidia's current first-run flow does not require login.
export const voiceController = {
  async speak(req, res, next) {
    try {
      const result = speakSchema.safeParse({
        text: req.method === 'POST' ? req.body?.text : req.query.text,
        lang: req.method === 'POST' ? req.body?.language || req.body?.lang : req.query.lang,
        speed: req.method === 'POST' ? req.body?.speed : req.query.speed,
        cognitiveState: req.method === 'POST' ? req.body?.cognitiveState : req.query.cognitiveState,
      });

      if (!result.success) {
        throw new ApiError(400, result.error.issues[0]?.message || 'Invalid request.', 'VALIDATION_ERROR');
      }

      const { text, lang } = result.data;
      const chunk = splitChunks(text)[0];
      const langCode = LANG_MAP[lang] || 'en';
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${langCode}&client=tw-ob`;

      const upstream = await fetch(url, {
        headers: {
          Referer: 'https://translate.google.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!upstream.ok) {
        throw new ApiError(502, "Voice playback isn't available right now.", 'VOICE_UPSTREAM_ERROR');
      }

      const buffer = Buffer.from(await upstream.arrayBuffer());
      res.set({ 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=3600' });
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  },
};
