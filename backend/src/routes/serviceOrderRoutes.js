import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { resolveTenant, requireTenant } from '../middleware/tenant.js';
import { validate } from '../middleware/validate.js';
import {
  createServiceOrderValidator, updateStatusValidator, addPartsValidator,
  assignMechanicsValidator, serviceOrderIdParamValidator,
} from '../validators/serviceOrderValidators.js';
import {
  listServiceOrders, getServiceOrder, createServiceOrder, updateServiceOrder,
  updateServiceOrderStatus, addServiceOrderParts, assignMechanics,
} from '../controllers/serviceOrderController.js';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/', listServiceOrders);
router.get('/:id', serviceOrderIdParamValidator, validate, getServiceOrder);

router.post('/', requireTenant, authorize('receptionist', 'admin'), createServiceOrderValidator, validate, createServiceOrder);
router.patch('/:id', requireTenant, authorize('receptionist', 'mechanic', 'admin'), serviceOrderIdParamValidator, validate, updateServiceOrder);
router.post('/:id/status', requireTenant, authorize('receptionist', 'mechanic', 'admin'), updateStatusValidator, validate, updateServiceOrderStatus);
router.post('/:id/parts', requireTenant, authorize('receptionist', 'mechanic', 'admin'), addPartsValidator, validate, addServiceOrderParts);
router.post('/:id/assign-mechanics', requireTenant, authorize('receptionist', 'admin'), assignMechanicsValidator, validate, assignMechanics);

export default router;
