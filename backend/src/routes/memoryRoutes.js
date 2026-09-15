import { Router } from 'express';
import { memoryController } from '../controllers/memoryController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', memoryController.list);
router.post('/', memoryController.create);
router.patch('/:id/star', memoryController.setStarred);
router.delete('/:id', memoryController.remove);

export default router;
