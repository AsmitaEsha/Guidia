import { Router } from 'express';
import { progressController } from '../controllers/progressController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/me', progressController.me);

export default router;
