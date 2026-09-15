import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/me', userController.me);
router.put('/me/preferences', userController.updatePreferences);

export default router;
