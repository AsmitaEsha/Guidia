import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { handler, ok } from '../lib/http.js';
import { progressService } from '../services/progressService.js';

const router = Router();

router.use(requireAuth);
router.get('/me', handler(async (req, res) => ok(res, { progress: await progressService.me(req.user.id) })));

export default router;
