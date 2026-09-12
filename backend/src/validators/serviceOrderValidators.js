import { body, param } from 'express-validator';
import { SERVICE_ORDER_STATUSES } from '../models/ServiceOrder.js';

export const serviceOrderIdParamValidator = [param('id').isMongoId().withMessage('Invalid service order id')];

export const createServiceOrderValidator = [
  body('customerId').isMongoId(),
  body('vehicleId').isMongoId(),
  body('appointmentId').optional().isMongoId(),
  body('complaint').optional().isString().isLength({ max: 2000 }),
  body('services').optional().isArray(),
  body('services.*.serviceId').optional().isMongoId(),
];

export const updateStatusValidator = [
  ...serviceOrderIdParamValidator,
  body('status').isIn(SERVICE_ORDER_STATUSES).withMessage('Invalid status value'),
];

export const addPartsValidator = [
  ...serviceOrderIdParamValidator,
  body('items').isArray({ min: 1 }).withMessage('At least one part is required'),
  body('items.*.partId').isMongoId(),
  body('items.*.quantity').isInt({ min: 1 }),
];

export const assignMechanicsValidator = [
  ...serviceOrderIdParamValidator,
  body('mechanicIds').isArray({ min: 1 }),
  body('mechanicIds.*').isMongoId(),
];
