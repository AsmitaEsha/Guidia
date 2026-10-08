import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { requireAuth, requireUserOrExtension } from '../middleware/auth.js';
import { limits } from '../middleware/rateLimits.js';
import { ApiError } from '../middleware/errorHandler.js';
import { handler, ok, created, parse } from '../lib/http.js';
import { LANGUAGE_CODES } from '../config/languages.js';
import { visionService } from '../services/visionService.js';

const router = Router();
const MAX_BYTES = 8 * 1024 * 1024;

// MIME filter is only a first gate; visionService decodes the real bytes.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1, fields: 10 },
  fileFilter: (req, file, cb) => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)) {
      return cb(new ApiError(400, 'Please upload a PNG, JPEG or WEBP screenshot.', 'UNSUPPORTED_FILE_TYPE'));
    }
    cb(null, true);
  },
});

function handleUpload(req, res, next) {
  upload.single('screenshot')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof ApiError) return next(err);
    if (err.code === 'LIMIT_FILE_SIZE') return next(new ApiError(400, 'That image is too large (max 8 MB).', 'FILE_TOO_LARGE'));
    next(new ApiError(400, 'Could not read that file.', 'UPLOAD_ERROR'));
  });
}

const fieldsSchema = z.object({
  question: z.string().trim().max(500).optional(),
  language: z.enum(LANGUAGE_CODES).optional(),
  cognitiveState: z.enum(['CALM', 'UNSURE', 'SCARED']).optional(),
  sourceUrl: z.string().max(2000).optional(),
});

async function analyze(req, res, source) {
  const fields = parse(fieldsSchema, req.body ?? {});
  const analysis = await visionService.analyze({ userId: req.user.id, file: req.file, ...fields, source, requestId: req.id });
  created(res, { analysis, analysisId: analysis.id });
}

// Web app upload.
router.post('/analyze', requireAuth, limits.vision, handleUpload, handler((req, res) => analyze(req, res, 'UPLOAD')));

// Browser extension capture (scoped extension token or user session).
router.post('/sessions', requireUserOrExtension('SCREENSHOT_CAPTURE'), limits.extension, handleUpload, handler((req, res) => analyze(req, res, 'EXTENSION')));

// Owner-only reads. Opened by the web app, so a normal user session.
router.get(['/sessions/:id', '/:id'], requireAuth, handler(async (req, res) => {
  ok(res, { analysis: await visionService.get(req.user.id, req.params.id) });
}));

router.get('/:id/image', requireAuth, handler(async (req, res) => {
  const { buffer, mimeType } = await visionService.image(req.user.id, req.params.id);
  res.set({ 'Content-Type': mimeType, 'Cache-Control': 'private, no-store' });
  res.send(buffer);
}));

router.post('/:id/ask', requireAuth, limits.vision, handler(async (req, res) => {
  const { question, cognitiveState } = parse(z.object({ question: z.string().trim().min(1).max(500), cognitiveState: z.enum(['CALM', 'UNSURE', 'SCARED']).optional() }), req.body);
  ok(res, await visionService.ask(req.user.id, req.params.id, { question, cognitiveState, requestId: req.id }));
}));

router.delete('/:id', requireAuth, handler(async (req, res) => {
  await visionService.remove(req.user.id, req.params.id);
  res.status(204).end();
}));

export default router;
