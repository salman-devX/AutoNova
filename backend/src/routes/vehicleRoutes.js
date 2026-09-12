import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { resolveTenant } from '../middleware/tenant.js';
import { validate } from '../middleware/validate.js';
import { createVehicleValidator, updateVehicleValidator, vehicleIdParamValidator } from '../validators/vehicleValidators.js';
import { listVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicleController.js';

const router = Router();

router.use(authenticate, resolveTenant);

// customer: own vehicles only (enforced in controller) · receptionist/admin: full workshop management
router.get('/', listVehicles);
router.get('/:id', vehicleIdParamValidator, validate, getVehicle);
router.post('/', authorize('customer', 'receptionist', 'admin'), createVehicleValidator, validate, createVehicle);
router.patch('/:id', authorize('customer', 'receptionist', 'admin'), updateVehicleValidator, validate, updateVehicle);
router.delete('/:id', authorize('customer', 'receptionist', 'admin'), vehicleIdParamValidator, validate, deleteVehicle);

export default router;
