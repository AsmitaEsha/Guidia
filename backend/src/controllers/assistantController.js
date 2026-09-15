import { z } from 'zod';
import { assistantService } from '../services/assistantService.js';
import { ApiError } from '../middleware/errorHandler.js';

const messageSchema = z.object({
  message: z.string().trim().min(1, 'Please type a question.').max(2000, 'That message is too long.'),
  cognitiveState: z.enum(['CALM', 'UNSURE', 'SCARED']).optional(),
  language: z.enum(['en', 'bn', 'hi']).optional(),
});

export const assistantController = {
  status(req, res) {
    res.json({ available: assistantService.isAvailable() });
  },

  async message(req, res, next) {
    try {
      const result = messageSchema.safeParse(req.body);
      if (!result.success) {
        throw new ApiError(400, result.error.issues[0]?.message || 'Invalid request.', 'VALIDATION_ERROR');
      }
      const { message, ...context } = result.data;
      const reply = await assistantService.reply(message, context);
      res.json({ reply });
    } catch (err) {
      next(err);
    }
  },
};
