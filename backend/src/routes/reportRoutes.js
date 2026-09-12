import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { resolveTenant } from '../middleware/tenant.js';
import {
  getAdminDashboard, getReceptionistDashboard, getMechanicDashboard, getCustomerDashboard,
} from '../controllers/reportController.js';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/receptionist', authorize('receptionist', 'admin'), getReceptionistDashboard);
router.get('/mechanic', authorize('mechanic', 'admin'), getMechanicDashboard);
router.get('/customer', authorize('customer'), getCustomerDashboard);

export default router;
