import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { resolveTenant, requireTenant } from '../middleware/tenant.js';
import { validate } from '../middleware/validate.js';
import { uploadMultipleImages, handleUploadErrors } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import { createInspectionValidator, updateInspectionValidator, inspectionIdParamValidator } from '../validators/inspectionValidators.js';
import { listInspections, getInspection, createInspection, updateInspection } from '../controllers/inspectionController.js';

const router = Router();

router.use(authenticate, resolveTenant, requireTenant);

router.get('/', listInspections);
router.get('/:id', inspectionIdParamValidator, validate, getInspection);
router.post(
  '/',
  authorize('mechanic', 'admin'),
  uploadLimiter,
  uploadMultipleImages,
  handleUploadErrors,
  createInspectionValidator,
  validate,
  createInspection
);
router.patch('/:id', authorize('mechanic', 'admin'), updateInspectionValidator, validate, updateInspection);

export default router;
