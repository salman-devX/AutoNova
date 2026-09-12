import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { resolveTenant, requireTenant } from '../middleware/tenant.js';
import { validate } from '../middleware/validate.js';
import { adjustStockValidator } from '../validators/inventoryValidators.js';
import { listTransactions, adjustInventory } from '../controllers/inventoryController.js';

const router = Router();

router.use(authenticate, resolveTenant, requireTenant, authorize('receptionist', 'admin'));

router.get('/transactions', listTransactions);
router.post('/adjust', adjustStockValidator, validate, adjustInventory);

export default router;
