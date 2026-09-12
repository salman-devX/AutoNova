import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { resolveTenant, requireTenant } from '../middleware/tenant.js';
import { listMechanics, updateMechanic } from '../controllers/mechanicController.js';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/', requireTenant, authorize('receptionist', 'admin'), listMechanics);
router.patch('/:id', requireTenant, authorize('admin'), updateMechanic);

export default router;
