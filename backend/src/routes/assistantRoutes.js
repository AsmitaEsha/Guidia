import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { assistantController } from '../controllers/assistantController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const assistantLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Please slow down a little before asking again.' } },
});

router.use(requireAuth);
router.get('/status', assistantController.status);
router.post('/message', assistantLimiter, assistantController.message);

export default router;
