import { adminService } from '../services/adminService.js';

export const adminController = {
  async listUsers(req, res, next) {
    try {
      const users = await adminService.listUsers();
      res.json({ users });
    } catch (err) { next(err); }
  },

  async analytics(req, res, next) {
    try {
      const analytics = await adminService.analytics();
      res.json({ analytics });
    } catch (err) { next(err); }
  },
};
