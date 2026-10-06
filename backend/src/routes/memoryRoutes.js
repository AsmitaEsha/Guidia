import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { handler, ok, created, parse } from '../lib/http.js';
import { memoryService } from '../services/memoryService.js';

const router = Router();
const category = z.enum(['MESSAGING', 'SAFETY', 'BANKING', 'LEARNING', 'SOCIAL', 'PRIVACY']);

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  category,
  summary: z.string().trim().min(1).max(1000),
  starred: z.boolean().optional(),
  skillKey: z.string().max(80).optional(),
});

const querySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: category.optional(),
  starred: z.enum(['true', 'false']).optional(),
});

router.use(requireAuth);

router.get('/', handler(async (req, res) => {
  const { q, category: cat, starred } = parse(querySchema, req.query);
  ok(res, { entries: await memoryService.list(req.user.id, { q, category: cat, starred: starred === 'true' }) });
}));

router.post('/', handler(async (req, res) => {
  created(res, { entry: await memoryService.create(req.user.id, parse(createSchema, req.body)) });
}));

router.patch('/:id/star', handler(async (req, res) => {
  const { starred } = parse(z.object({ starred: z.boolean() }), req.body);
  ok(res, { entry: await memoryService.setStarred(req.params.id, req.user.id, starred) });
}));

router.delete('/:id', handler(async (req, res) => {
  await memoryService.remove(req.params.id, req.user.id);
  res.status(204).end();
}));

export default router;
