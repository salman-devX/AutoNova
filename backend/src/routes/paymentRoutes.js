import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { resolveTenant, requireTenant } from '../middleware/tenant.js';
import { validate } from '../middleware/validate.js';
import { createPaymentValidator } from '../validators/invoiceValidators.js';
import { listPayments, createPayment } from '../controllers/paymentController.js';

const router = Router();

router.use(authenticate, resolveTenant, requireTenant, authorize('receptionist', 'admin'));

router.get('/', listPayments);
router.post('/', createPaymentValidator, validate, createPayment);

export default router;
