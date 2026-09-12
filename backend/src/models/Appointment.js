import mongoose from 'mongoose';

const STATUSES = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rescheduled'];
const ACTIVE_STATUSES = ['pending', 'confirmed', 'in-progress'];

const appointmentSchema = new mongoose.Schema(
  {
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    mechanicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mechanic', default: null },

    start: { type: Date, required: true },
    end: { type: Date, required: true },
    durationMinutes: { type: Number, required: true, min: 5 },

    notes: { type: String, default: '' },
    status: { type: String, enum: STATUSES, default: 'pending', index: true },
    cancellationReason: { type: String, default: null },
    reschedule: {
      fromAppointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
      rescheduledAt: { type: Date, default: null },
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

appointmentSchema.index({ workshopId: 1, start: 1, status: 1 });
appointmentSchema.index({ workshopId: 1, customerId: 1, start: -1 });
appointmentSchema.index({ workshopId: 1, mechanicId: 1, start: 1 });

/**
 * DOUBLE-BOOKING GUARD (layer 1 — database constraint):
 * No two ACTIVE appointments for the same mechanic, in the same workshop,
 * can share the exact same start timestamp. Since availability slots are
 * generated on a fixed grid (see utils/date.js + appointmentService), two
 * concurrent requests for the *same slot* will always collide on this index,
 * guaranteeing only one insert can succeed even under a race condition.
 *
 * This is deliberately paired with an application-level overlap check
 * (see services/appointmentService.js) inside a MongoDB transaction, which
 * also catches partial-overlap conflicts for variable-duration services.
 */
appointmentSchema.index(
  { workshopId: 1, mechanicId: 1, start: 1 },
  {
    unique: true,
    partialFilterExpression: {
      mechanicId: { $type: 'objectId' },
      status: { $in: ACTIVE_STATUSES },
    },
  }
);

export const APPOINTMENT_STATUSES = STATUSES;
export const APPOINTMENT_ACTIVE_STATUSES = ACTIVE_STATUSES;
export default mongoose.model('Appointment', appointmentSchema);
