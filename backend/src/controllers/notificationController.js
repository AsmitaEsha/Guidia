import { notificationService } from '../services/notificationService.js';

export const notificationController = {
  async list(req, res, next) {
    try {
      const items = await notificationService.list(req.user.id);
      res.json({ items });
    } catch (err) { next(err); }
  },
};
