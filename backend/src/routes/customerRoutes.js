import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { resolveTenant, requireTenant } from '../middleware/tenant.js';
import { validate } from '../middleware/validate.js';
import { customerIdParamValidator, updateCustomerValidator } from '../validators/customerValidators.js';
import { getMyCustomerProfile, listCustomers, getCustomer, updateCustomer } from '../controllers/customerController.js';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/me', getMyCustomerProfile);

router.get('/', requireTenant, authorize('receptionist', 'admin'), listCustomers);
router.get('/:id', requireTenant, authorize('receptionist', 'admin'), customerIdParamValidator, validate, getCustomer);
router.patch('/:id', requireTenant, authorize('receptionist', 'admin'), updateCustomerValidator, validate, updateCustomer);

export default router;
