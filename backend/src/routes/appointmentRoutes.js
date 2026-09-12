import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { resolveTenant } from '../middleware/tenant.js';
import { validate } from '../middleware/validate.js';
import { verifyTurnstile } from '../middleware/turnstile.js';
import { appointmentLimiter } from '../middleware/rateLimiter.js';
import {
  availabilityQueryValidator, createAppointmentValidator,
  rescheduleAppointmentValidator, cancelAppointmentValidator, appointmentIdParamValidator,
} from '../validators/appointmentValidators.js';
import {
  getAvailability, listAppointments, getAppointment, createAppointment,
  confirmAppointment, cancelAppointment, rescheduleAppointment,
} from '../controllers/appointmentController.js';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/availability', availabilityQueryValidator, validate, getAvailability);
router.get('/', listAppointments);
router.get('/:id', appointmentIdParamValidator, validate, getAppointment);

router.post(
  '/',
  authorize('customer', 'receptionist', 'admin'),
  appointmentLimiter,
  verifyTurnstile,
  createAppointmentValidator,
  validate,
  createAppointment
);

router.patch('/:id/confirm', authorize('receptionist', 'admin'), appointmentIdParamValidator, validate, confirmAppointment);
router.post('/:id/cancel', cancelAppointmentValidator, validate, cancelAppointment);
router.post('/:id/reschedule', rescheduleAppointmentValidator, validate, rescheduleAppointment);

export default router;
