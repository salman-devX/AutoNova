import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { resolveTenant } from '../middleware/tenant.js';
import { validate } from '../middleware/validate.js';
import { createInvoiceValidator, invoiceIdParamValidator } from '../validators/invoiceValidators.js';
import { listInvoices, getInvoice, createInvoice } from '../controllers/invoiceController.js';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/', listInvoices);
router.get('/:id', invoiceIdParamValidator, validate, getInvoice);
router.post('/', authorize('receptionist', 'admin'), createInvoiceValidator, validate, createInvoice);

export default router;
