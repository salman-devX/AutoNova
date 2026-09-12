import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { resolveTenant } from '../middleware/tenant.js';
import { updateMe, createStaffUser, listUsers, deactivateUser } from '../controllers/userController.js';

const router = Router();

router.use(authenticate);

router.patch('/me', updateMe);

router.get('/', resolveTenant, authorize('admin'), listUsers);
router.post('/staff', resolveTenant, authorize('admin'), createStaffUser);
router.patch('/:id/deactivate', resolveTenant, authorize('admin'), deactivateUser);

export default router;
