import mongoose from 'mongoose';
import Appointment, { APPOINTMENT_ACTIVE_STATUSES } from '../models/Appointment.js';
import Workshop from '../models/Workshop.js';
import Service from '../models/Service.js';
import Vehicle from '../models/Vehicle.js';
import Mechanic from '../models/Mechanic.js';
import { ApiError } from '../utils/ApiError.js';
import { addMinutes, dayBounds, generateSlots, rangesOverlap } from '../utils/date.js';
import { notificationService } from './notificationService.js';
import { emailService } from './emailService.js';

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/**
 * Computes bookable slots for a given workshop/service/date, subtracting
 * whatever is already booked (any ACTIVE appointment, optionally scoped to
 * one mechanic). This is read-only and does NOT itself prevent race
 * conditions — createAppointment() below is what actually guarantees safety.
 */
async function getAvailability({ workshopId, serviceId, date, mechanicId }) {
  const workshop = await Workshop.findOne({ _id: workshopId, isActive: true });
  if (!workshop) throw ApiError.notFound('Workshop not found or inactive.');

  const service = await Service.findOne({ _id: serviceId, workshopId, isActive: true });
  if (!service) throw ApiError.notFound('Service not found for this workshop.');

  const dayKey = DAY_KEYS[new Date(date).getUTCDay()];
  const daySettings = workshop.workingHours.find((w) => w.day === dayKey);
  if (daySettings?.isClosed) return { date, slots: [] };

  const [openHour, openMin] = (daySettings?.open || '09:00').split(':').map(Number);
  const [closeHour, closeMin] = (daySettings?.close || '18:00').split(':').map(Number);

  const candidateSlots = generateSlots({
    date,
    openHour: openHour + openMin / 60,
    closeHour: closeHour + closeMin / 60,
    stepMinutes: workshop.settings.appointmentStepMinutes,
    durationMinutes: service.durationMinutes,
  });

  const { start: dayStart, end: dayEnd } = dayBounds(date);
  const filter = {
    workshopId,
    status: { $in: APPOINTMENT_ACTIVE_STATUSES },
    start: { $lt: dayEnd },
    end: { $gt: dayStart },
  };
  if (mechanicId) filter.mechanicId = mechanicId;

  const existing = await Appointment.find(filter).select('start end mechanicId').lean();

  // Don't offer slots already in the past for "today".
  const now = new Date();

  const slots = candidateSlots
    .filter((slot) => slot.start > now)
    .map((slot) => {
      const conflicts = existing.some((appt) => rangesOverlap(slot.start, slot.end, appt.start, appt.end));
      return { start: slot.start, end: slot.end, available: !conflicts };
    });

  return { date, workshopId, serviceId, mechanicId: mechanicId || null, slots };
}

/**
 * Creates an appointment with two layers of double-booking protection:
 *
 *  1. A MongoDB session transaction that re-checks for any overlapping
 *     ACTIVE appointment for the target mechanic immediately before insert —
 *     closing the classic "check availability, then insert" race window.
 *  2. The partial unique index on {workshopId, mechanicId, start} (see
 *     models/Appointment.js), which guarantees the database itself rejects
 *     a second appointment starting at the exact same grid slot even if two
 *     transactions somehow interleave. A resulting E11000 is normalized to
 *     HTTP 409 by the global error handler.
 *
 * NOTE: mongoose transactions require the target MongoDB to be a replica set
 * (the default for MongoDB Atlas). If connected to a lone standalone mongod,
 * the transaction call below will throw — see README "Local development" note.
 */
async function createAppointment({ workshopId, customerId, vehicleId, serviceId, mechanicId, start, notes, createdBy }) {
  const workshop = await Workshop.findOne({ _id: workshopId, isActive: true });
  if (!workshop) throw ApiError.notFound('Workshop not found or inactive.');

  const [vehicle, service] = await Promise.all([
    Vehicle.findOne({ _id: vehicleId, workshopId, customerId }),
    Service.findOne({ _id: serviceId, workshopId, isActive: true }),
  ]);
  if (!vehicle) throw ApiError.badRequest('Vehicle does not belong to this customer/workshop.', 'INVALID_VEHICLE');
  if (!service) throw ApiError.badRequest('Service is not available at this workshop.', 'INVALID_SERVICE');

  if (mechanicId) {
    const mechanic = await Mechanic.findOne({ _id: mechanicId, workshopId, isActive: true });
    if (!mechanic) throw ApiError.badRequest('Mechanic does not belong to this workshop.', 'INVALID_MECHANIC');
  }

  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) throw ApiError.badRequest('Invalid start time.', 'INVALID_DATE');
  if (startDate.getTime() < Date.now()) throw ApiError.badRequest('Cannot book an appointment in the past.', 'PAST_APPOINTMENT');

  const endDate = addMinutes(startDate, service.durationMinutes);

  const session = await mongoose.startSession();
  let appointment;
  try {
    await session.withTransaction(async () => {
      if (mechanicId) {
        const conflict = await Appointment.findOne({
          workshopId,
          mechanicId,
          status: { $in: APPOINTMENT_ACTIVE_STATUSES },
          start: { $lt: endDate },
          end: { $gt: startDate },
        }).session(session);

        if (conflict) {
          throw ApiError.conflict('This time slot is no longer available for the selected mechanic.', 'APPOINTMENT_CONFLICT');
        }
      }

      const created = await Appointment.create(
        [{
          workshopId, customerId, vehicleId, serviceId, mechanicId: mechanicId || null,
          start: startDate, end: endDate, durationMinutes: service.durationMinutes,
          notes: notes || '', status: 'pending', createdBy,
        }],
        { session }
      );
      appointment = created[0];
    });
  } finally {
    await session.endSession();
  }

  await notificationService.notify({
    userId: createdBy,
    workshopId,
    type: 'appointment_booked',
    title: 'Appointment booked',
    message: `Your appointment for ${service.name} on ${startDate.toDateString()} has been requested.`,
    relatedEntity: 'Appointment',
    relatedEntityId: appointment._id,
  });
  emailService.sendAppointmentBooked({ appointment, service, workshop }).catch(() => {});

  return appointment;
}

async function confirmAppointment(appointment, changedBy) {
  if (appointment.status !== 'pending') {
    throw ApiError.badRequest(`Cannot confirm an appointment in "${appointment.status}" status.`, 'INVALID_STATUS_TRANSITION');
  }
  appointment.status = 'confirmed';
  await appointment.save();

  await notificationService.notify({
    userId: appointment.createdBy,
    workshopId: appointment.workshopId,
    type: 'appointment_confirmed',
    title: 'Appointment confirmed',
    message: 'Your appointment has been confirmed.',
    relatedEntity: 'Appointment',
    relatedEntityId: appointment._id,
  });

  return appointment;
}

async function cancelAppointment(appointment, reason, changedBy) {
  if (['completed', 'cancelled'].includes(appointment.status)) {
    throw ApiError.badRequest(`Cannot cancel an appointment in "${appointment.status}" status.`, 'INVALID_STATUS_TRANSITION');
  }
  appointment.status = 'cancelled';
  appointment.cancellationReason = reason || '';
  await appointment.save();

  await notificationService.notify({
    userId: appointment.createdBy,
    workshopId: appointment.workshopId,
    type: 'appointment_cancelled',
    title: 'Appointment cancelled',
    message: reason ? `Your appointment was cancelled: ${reason}` : 'Your appointment has been cancelled.',
    relatedEntity: 'Appointment',
    relatedEntityId: appointment._id,
  });

  return appointment;
}

/** Reschedule = cancel old (status "rescheduled") + create a fresh one, revalidating availability. */
async function rescheduleAppointment(appointment, newStart, changedBy) {
  if (['completed', 'cancelled'].includes(appointment.status)) {
    throw ApiError.badRequest(`Cannot reschedule an appointment in "${appointment.status}" status.`, 'INVALID_STATUS_TRANSITION');
  }

  const replacement = await createAppointment({
    workshopId: appointment.workshopId,
    customerId: appointment.customerId,
    vehicleId: appointment.vehicleId,
    serviceId: appointment.serviceId,
    mechanicId: appointment.mechanicId,
    start: newStart,
    notes: appointment.notes,
    createdBy: changedBy,
  });
  replacement.reschedule = { fromAppointmentId: appointment._id, rescheduledAt: new Date() };
  replacement.status = 'confirmed';
  await replacement.save();

  appointment.status = 'rescheduled';
  await appointment.save();

  return replacement;
}

export const appointmentService = {
  getAvailability,
  createAppointment,
  confirmAppointment,
  cancelAppointment,
  rescheduleAppointment,
};
