import { z } from 'zod';
import { safetyService } from '../services/safetyService.js';
import { ApiError } from '../middleware/errorHandler.js';

const analyzeSchema = z.object({
  contentType: z.enum(['URL', 'SMS', 'MESSAGE']),
  content: z.string().trim().min(1, 'Please paste a link or message to check.').max(5000, 'That is too long to check.'),
});

const interceptionSchema = z.object({
  actionType: z.string().trim().min(1).max(100),
  summary: z.object({
    what: z.string().max(500),
    who: z.string().max(500),
    amountOrData: z.string().max(500),
    consequence: z.string().max(500),
  }),
  resolution: z.enum(['PROCEED', 'EDIT', 'HELP']),
});

export const safetyController = {
  async analyze(req, res, next) {
    try {
      const result = analyzeSchema.safeParse(req.body);
      if (!result.success) {
        throw new ApiError(400, result.error.issues[0]?.message || 'Invalid request.', 'VALIDATION_ERROR');
      }
      const analysis = await safetyService.analyze({ userId: req.user.id, ...result.data });
      res.json(analysis);
    } catch (err) {
      next(err);
    }
  },

  async history(req, res, next) {
    try {
      const items = await safetyService.history(req.user.id);
      res.json({ items });
    } catch (err) {
      next(err);
    }
  },

  async logInterception(req, res, next) {
    try {
      const result = interceptionSchema.safeParse(req.body);
      if (!result.success) {
        throw new ApiError(400, result.error.issues[0]?.message || 'Invalid request.', 'VALIDATION_ERROR');
      }
      const record = await safetyService.logInterception({ userId: req.user.id, ...result.data });
      res.status(201).json({ id: record.id });
    } catch (err) {
      next(err);
    }
  },

  async interceptionHistory(req, res, next) {
    try {
      const items = await safetyService.interceptionHistory(req.user.id);
      res.json({ items: items.map((i) => ({ ...i, summary: JSON.parse(i.summary) })) });
    } catch (err) {
      next(err);
    }
  },
};
