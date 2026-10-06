import { Router } from 'express';
import { authController as c } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAllowedOrigin } from '../middleware/originGuard.js';
import { limits } from '../middleware/rateLimits.js';
import { handler } from '../lib/http.js';

const router = Router();

router.post('/register', limits.auth, handler(c.register));
router.post('/login', limits.auth, handler(c.login));
// Cookie-authenticated → CSRF origin check.
router.post('/refresh', requireAllowedOrigin, handler(c.refresh));
router.post('/logout', requireAllowedOrigin, handler(c.logout));
router.get('/me', requireAuth, handler(c.me));
router.post('/forgot-password', limits.passwordReset, handler(c.forgotPassword));
router.post('/reset-password', limits.auth, handler(c.resetPassword));
router.get('/sessions', requireAuth, handler(c.sessions));
router.delete('/sessions/:id', requireAuth, handler(c.revokeSession));

export default router;
