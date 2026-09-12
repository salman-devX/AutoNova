import { body, param, query } from 'express-validator';

export const appointmentIdParamValidator = [param('id').isMongoId().withMessage('Invalid appointment id')];

export const availabilityQueryValidator = [
  query('workshopId').isMongoId().withMessage('Valid workshopId is required'),
  query('serviceId').isMongoId().withMessage('Valid serviceId is required'),
  query('date').isISO8601().withMessage('Valid date is required'),
  query('mechanicId').optional().isMongoId(),
];

export const createAppointmentValidator = [
  body('workshopId').isMongoId(),
  body('vehicleId').isMongoId(),
  body('serviceId').isMongoId(),
  body('mechanicId').optional().isMongoId(),
  body('start').isISO8601().withMessage('Valid start time is required'),
  body('notes').optional().isString().isLength({ max: 1000 }),
  // Optional: only enforced server-side when TURNSTILE_SECRET_KEY is configured (see middleware/turnstile.js).
  body('turnstileToken').optional().isString(),
];

export const rescheduleAppointmentValidator = [
  ...appointmentIdParamValidator,
  body('start').isISO8601().withMessage('Valid start time is required'),
];

export const cancelAppointmentValidator = [
  ...appointmentIdParamValidator,
  body('reason').optional().isString().isLength({ max: 500 }),
];
