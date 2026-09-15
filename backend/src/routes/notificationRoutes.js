import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', notificationController.list);

export default router;
