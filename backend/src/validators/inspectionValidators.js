import { body, param } from 'express-validator';
import { INSPECTION_CATEGORIES, INSPECTION_RATINGS } from '../models/Inspection.js';

export const inspectionIdParamValidator = [param('id').isMongoId().withMessage('Invalid inspection id')];

export const createInspectionValidator = [
  body('serviceOrderId').isMongoId(),
  body('vehicleId').isMongoId(),
  body('items').isArray({ min: 1 }),
  body('items.*.category').isIn(INSPECTION_CATEGORIES),
  body('items.*.rating').isIn(INSPECTION_RATINGS),
  body('recommendations').optional().isString().isLength({ max: 2000 }),
];

export const updateInspectionValidator = [
  ...inspectionIdParamValidator,
  body('items').optional().isArray(),
  body('recommendations').optional().isString().isLength({ max: 2000 }),
  body('completedAt').optional().isISO8601(),
];
