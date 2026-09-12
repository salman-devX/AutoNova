import mongoose from 'mongoose';

const TYPES = [
  'appointment_booked', 'appointment_confirmed', 'appointment_cancelled',
  'inspection_started', 'inspection_completed', 'service_started', 'service_completed',
  'vehicle_ready', 'invoice_generated', 'payment_received', 'low_stock',
];

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true, index: true },
    type: { type: String, enum: TYPES, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    relatedEntity: { type: String, default: null }, // e.g. "Appointment", "Invoice"
    relatedEntityId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const NOTIFICATION_TYPES = TYPES;
export default mongoose.model('Notification', notificationSchema);
