import { Router } from 'express';
import { guardianController } from '../controllers/guardianController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/invite', guardianController.invite);
router.get('/', guardianController.list);
router.post('/:id/accept', guardianController.accept);
router.post('/:id/revoke', guardianController.revoke);

router.post('/approvals', guardianController.requestApproval);
router.get('/approvals/mine', guardianController.listMyApprovals);
router.post('/approvals/:id/resolve', guardianController.resolveApproval);
router.get('/:relationshipId/approvals', guardianController.listApprovals);

export default router;
