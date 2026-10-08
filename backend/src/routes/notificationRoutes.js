import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { handler, ok } from '../lib/http.js';
import { notificationService } from '../notifications/notificationService.js';

const router = Router();

router.use(requireAuth);

router.get('/', handler(async (req, res) => {
  const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
  ok(res, await notificationService.list(req.user.id, { cursor }));
}));
router.get('/unread-count', handler(async (req, res) => ok(res, { unreadCount: await notificationService.unreadCount(req.user.id) })));
router.post('/read-all', handler(async (req, res) => ok(res, await notificationService.markAllRead(req.user.id))));
router.post('/:id/read', handler(async (req, res) => {
  await notificationService.markRead(req.user.id, req.params.id);
  res.status(204).end();
}));

export default router;
