import mongoose from 'mongoose';

const STATUSES = [
  'booked', 'vehicle_received', 'inspection', 'in_progress',
  'quality_check', 'ready_for_pickup', 'completed', 'cancelled',
];

// Valid forward transitions — enforced in serviceOrderService, not just documented.
export const STATUS_TRANSITIONS = {
  booked: ['vehicle_received', 'cancelled'],
  vehicle_received: ['inspection', 'cancelled'],
  inspection: ['in_progress', 'cancelled'],
  in_progress: ['quality_check', 'cancelled'],
  quality_check: ['ready_for_pickup', 'in_progress'], // failed QC can bounce back to in_progress
  ready_for_pickup: ['completed'],
  completed: [],
  cancelled: [],
};

const lineServiceSchema = new mongoose.Schema(
  {
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    name: { type: String, required: true }, // snapshot at time of order — price history stays accurate
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const linePartSchema = new mongoose.Schema(
  {
    partId: { type: mongoose.Schema.Types.ObjectId, ref: 'Part', required: true },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const serviceOrderSchema = new mongoose.Schema(
  {
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
    assignedMechanics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mechanic' }],

    complaint: { type: String, default: '' },
    diagnosis: { type: String, default: '' },

    services: { type: [lineServiceSchema], default: [] },
    parts: { type: [linePartSchema], default: [] },
    laborCost: { type: Number, default: 0, min: 0 },

    inspectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inspection', default: null },
    notes: { type: String, default: '' },

    status: { type: String, enum: STATUSES, default: 'booked', index: true },

    estimatedCost: { type: Number, default: 0, min: 0 },
    actualCost: { type: Number, default: 0, min: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    statusHistory: [
      {
        status: { type: String, enum: STATUSES },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

serviceOrderSchema.index({ workshopId: 1, status: 1 });
serviceOrderSchema.index({ workshopId: 1, assignedMechanics: 1 });
serviceOrderSchema.index({ workshopId: 1, createdAt: -1 });

export const SERVICE_ORDER_STATUSES = STATUSES;
export default mongoose.model('ServiceOrder', serviceOrderSchema);
