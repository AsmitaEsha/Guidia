import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { voiceController } from '../controllers/voiceController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const voiceLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Please wait a moment before requesting more voice playback.' } },
});

router.use(requireAuth);
router.get('/speak', voiceLimiter, voiceController.speak);

export default router;
