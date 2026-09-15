import { progressService } from '../services/progressService.js';

export const progressController = {
  async me(req, res, next) {
    try {
      const progress = await progressService.me(req.user.id);
      res.json({ progress });
    } catch (err) { next(err); }
  },
};
