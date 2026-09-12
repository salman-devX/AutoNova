import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { resolveTenant, requireTenant } from '../middleware/tenant.js';
import { listServices, createService, updateService, deleteService } from '../controllers/serviceController.js';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/', listServices);
router.post('/', requireTenant, authorize('admin'), createService);
router.patch('/:id', requireTenant, authorize('admin'), updateService);
router.delete('/:id', requireTenant, authorize('admin'), deleteService);

export default router;
