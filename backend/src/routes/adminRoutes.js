import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));
router.get('/users', adminController.listUsers);
router.get('/analytics', adminController.analytics);

export default router;
