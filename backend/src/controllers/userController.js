import { z } from 'zod';
import { userService } from '../services/userService.js';
import { ApiError } from '../middleware/errorHandler.js';

const preferencesSchema = z.object({
  preferredLanguage: z.enum(['en', 'bn', 'hi']).optional(),
  cognitiveState: z.enum(['CALM', 'UNSURE', 'SCARED']).optional(),
  fontSize: z.number().int().min(14).max(28).optional(),
  darkMode: z.boolean().optional(),
  reducedMotion: z.boolean().optional(),
  voiceEnabled: z.boolean().optional(),
  voiceSpeed: z.number().min(0.75).max(1.25).optional(),
  voiceAutoPlay: z.boolean().optional(),
  onboardingDone: z.boolean().optional(),
}).strict();

export const userController = {
  async me(req, res, next) {
    try {
      const user = await userService.me(req.user.id);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },

  async updatePreferences(req, res, next) {
    try {
      const result = preferencesSchema.safeParse(req.body);
      if (!result.success) {
        throw new ApiError(400, result.error.issues[0]?.message || 'Invalid request.', 'VALIDATION_ERROR');
      }
      if (Object.keys(result.data).length === 0) {
        throw new ApiError(400, 'Nothing to update.', 'VALIDATION_ERROR');
      }
      const user = await userService.updatePreferences(req.user.id, result.data);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },
};
