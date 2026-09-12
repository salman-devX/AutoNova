import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { resolveTenant, requireTenant } from '../middleware/tenant.js';
import { validate } from '../middleware/validate.js';
import { createPartValidator, updatePartValidator, partIdParamValidator } from '../validators/inventoryValidators.js';
import { listParts, getPart, createPart, updatePart, deletePart } from '../controllers/partController.js';

const router = Router();

router.use(authenticate, resolveTenant, requireTenant);

router.get('/', listParts);
router.get('/:id', partIdParamValidator, validate, getPart);
router.post('/', authorize('receptionist', 'admin'), createPartValidator, validate, createPart);
router.patch('/:id', authorize('receptionist', 'admin'), updatePartValidator, validate, updatePart);
router.delete('/:id', authorize('receptionist', 'admin'), partIdParamValidator, validate, deletePart);

export default router;
