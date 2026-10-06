import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { limits } from '../middleware/rateLimits.js';
import { ApiError } from '../middleware/errorHandler.js';
import { handler, ok, parse } from '../lib/http.js';
import { LANGUAGES, LANGUAGE_CODES } from '../config/languages.js';
import { env } from '../config/env.js';
import { aiGateway } from '../ai/gateway.js';
import { speechService } from '../ai/speech.js';
import { redactSensitive } from '../security/sensitiveDataGuard.js';

const router = Router();
const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // ~ 1–2 minutes of compressed speech
const AUDIO_TYPES = ['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AUDIO_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    const base = file.mimetype.split(';')[0];
    if (!AUDIO_TYPES.includes(base)) return cb(new ApiError(400, 'That recording format is not supported.', 'UNSUPPORTED_AUDIO'));
    cb(null, true);
  },
});

function available() {
  return aiGateway.supportsVoice() && !env.killSwitches.voice;
}

function cleanTextForSpeech(text) {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/https?:\/\/\S+/gi, ' link ')
    .replace(/[`*_#~|[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const speakSchema = z.object({
  text: z.string().trim().min(1).max(600),
  language: z.enum(LANGUAGE_CODES).optional(),
  speed: z.number().min(0.7).max(1.3).optional(),
});

// Speaking works before sign-in too (landing demos, onboarding), so it
// uses optional auth and the per-account/IP rate limit.
// One chunk per request (client splits long text at sentence boundaries,
// so playback can start quickly and be interrupted between chunks).
router.post('/speak', optionalAuth, limits.voice, handler(async (req, res) => {
  if (!speechService.available()) throw new ApiError(503, 'Spoken answers are not available right now.', 'VOICE_UNAVAILABLE');
  const { text, language = 'en', speed = 1 } = parse(speakSchema, req.body);
  const { audio, mimeType } = await speechService.synthesize({
    // Never read a secret aloud, even if one slipped into the text.
    text: cleanTextForSpeech(redactSensitive(text).text),
    language,
    locale: LANGUAGES[language].locale,
    speed,
    meta: { feature: 'tts', userId: req.user?.id, requestId: req.id },
  });
  res.set({ 'Content-Type': mimeType, 'Cache-Control': 'private, max-age=600' });
  res.send(audio);
}));

router.use(requireAuth);

// The client asks before choosing between server voice and its fallbacks.
router.get('/status', (req, res) => ok(res, { available: available(), speech: speechService.engine(), languages: LANGUAGE_CODES }));

router.post('/transcribe', limits.voice, (req, res, next) => {
  upload.single('audio')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof ApiError) return next(err);
    if (err.code === 'LIMIT_FILE_SIZE') return next(new ApiError(400, 'That recording is too long. Please try a shorter question.', 'AUDIO_TOO_LARGE'));
    next(new ApiError(400, 'Could not read that recording.', 'UPLOAD_ERROR'));
  });
}, handler(async (req, res) => {
  if (!available()) throw new ApiError(503, 'Voice input is not available right now. Please type your question.', 'VOICE_UNAVAILABLE');
  if (!req.file) throw new ApiError(400, 'No recording was received.', 'NO_FILE');
  const language = LANGUAGE_CODES.includes(req.body?.language) ? req.body.language : undefined;
  const { text } = await aiGateway.transcribe({
    buffer: req.file.buffer,
    mimeType: req.file.mimetype.split(';')[0],
    language,
    meta: { feature: 'stt', userId: req.user.id, requestId: req.id },
  });
  // The transcript goes back to the user for review before anything acts
  // on it; secrets are removed before it leaves the server.
  const { text: transcript, count } = redactSensitive(text);
  ok(res, { transcript, secretsRemoved: count, language: language ?? null });
}));

export default router;
