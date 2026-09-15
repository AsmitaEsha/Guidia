import { z } from 'zod';
import { ApiError } from '../middleware/errorHandler.js';

const MAX_CHUNK = 180;
const LANG_MAP = { en: 'en', bn: 'bn', hi: 'hi' };

const speakSchema = z.object({
  text: z.string().trim().min(1).max(2000),
  lang: z.enum(['en', 'bn', 'hi']).optional(),
});

function splitChunks(text) {
  const chunks = [];
  let rem = text;
  while (rem.length > 0) {
    if (rem.length <= MAX_CHUNK) { chunks.push(rem); break; }
    let idx = rem.lastIndexOf(' ', MAX_CHUNK);
    if (idx < 0) idx = MAX_CHUNK;
    chunks.push(rem.slice(0, idx));
    rem = rem.slice(idx).trimStart();
  }
  return chunks;
}

// Proxies Google Translate's TTS endpoint server-side so voice playback
// works in production too, not just `npm run dev` (the old Vite-proxy-only
// approach). Fetches only the first chunk and streams it back; the client
// requests subsequent chunks by calling again with the remaining text if
// needed (kept simple: the frontend already chunks and calls sequentially).
export const voiceController = {
  async speak(req, res, next) {
    try {
      const result = speakSchema.safeParse({ text: req.query.text, lang: req.query.lang });
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
