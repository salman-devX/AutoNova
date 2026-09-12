import { body, param } from 'express-validator';

export const vehicleIdParamValidator = [param('id').isMongoId().withMessage('Invalid vehicle id')];

export const createVehicleValidator = [
  // Only sent by staff (receptionist/mechanic/admin) creating a vehicle on a
  // customer's behalf. When a customer adds their own vehicle, the controller
  // derives customerId from their own Customer record instead — the body
  // won't include it, so this must not be a hard requirement here.
  body('customerId').optional().isMongoId().withMessage('Valid customerId is required'),
  body('make').trim().notEmpty(),
  body('model').trim().notEmpty(),
  body('year').optional().isInt({ min: 1950, max: new Date().getFullYear() + 1 }),
  body('registrationNumber').trim().notEmpty().withMessage('Registration number is required'),
  body('vin').optional().isString(),
  body('mileage').optional().isFloat({ min: 0 }),
  body('color').optional().isString(),
];

export const updateVehicleValidator = [
  ...vehicleIdParamValidator,
  body('make').optional().trim().notEmpty(),
  body('model').optional().trim().notEmpty(),
  body('year').optional().isInt({ min: 1950, max: new Date().getFullYear() + 1 }),
  body('mileage').optional().isFloat({ min: 0 }),
  body('color').optional().isString(),
  body('notes').optional().isString(),
];
