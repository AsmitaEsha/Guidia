import { z } from 'zod';
import { memoryService } from '../services/memoryService.js';
import { ApiError } from '../middleware/errorHandler.js';

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  category: z.enum(['MESSAGING', 'SAFETY', 'BANKING', 'LEARNING', 'SOCIAL']),
  summary: z.string().trim().min(1).max(1000),
  starred: z.boolean().optional(),
});

const starSchema = z.object({
  starred: z.boolean(),
});

function parse(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.issues[0]?.message || 'Invalid request.', 'VALIDATION_ERROR');
  }
  return result.data;
}

export const memoryController = {
  async list(req, res, next) {
    try {
      const entries = await memoryService.list(req.user.id);
      res.json({ entries });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const data = parse(createSchema, req.body);
      const entry = await memoryService.create(req.user.id, data);
      res.status(201).json({ entry });
    } catch (err) { next(err); }
  },

  async setStarred(req, res, next) {
    try {
      const { starred } = parse(starSchema, req.body);
      const entry = await memoryService.setStarred(req.params.id, req.user.id, starred);
      res.json({ entry });
    } catch (err) { next(err); }
  },

  async remove(req, res, next) {
    try {
      await memoryService.remove(req.params.id, req.user.id);
      res.status(204).end();
    } catch (err) { next(err); }
  },
};
