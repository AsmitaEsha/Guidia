import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { safetyController } from '../controllers/safetyController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const safetyLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Please slow down a little before checking again.' } },
});

router.use(requireAuth);
router.post('/analyze', safetyLimiter, safetyController.analyze);
router.get('/history', safetyController.history);
router.post('/interceptions', safetyController.logInterception);
router.get('/interceptions', safetyController.interceptionHistory);

export default router;
