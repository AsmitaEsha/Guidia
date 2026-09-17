import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { screenshotController, screenshotUpload } from '../controllers/screenshotController.js';
import { requireAuth } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = Router();

const screenshotLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Please wait a moment before analyzing another screenshot.' } },
});

function handleUpload(req, res, next) {
  screenshotUpload.single('screenshot')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof ApiError) return next(err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, 'That image is too large (max 8MB).', 'FILE_TOO_LARGE'));
    }
    next(new ApiError(400, 'Could not read that file.', 'UPLOAD_ERROR'));
  });
}

router.post('/sessions', screenshotLimiter, handleUpload, screenshotController.createSession);
router.get('/sessions/:analysisId', screenshotController.getSession);

router.use(requireAuth);
router.post('/analyze', screenshotLimiter, handleUpload, screenshotController.analyze);

export default router;
