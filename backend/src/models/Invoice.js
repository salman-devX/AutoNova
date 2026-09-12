import mongoose from 'mongoose';

const PAYMENT_STATUSES = ['unpaid', 'partially_paid', 'paid', 'cancelled'];

const invoiceLineSchema = new mongoose.Schema(
  { name: String, quantity: Number, unitPrice: Number, lineTotal: Number },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    serviceOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceOrder', required: true },

    invoiceNumber: { type: String, required: true, unique: true },

    services: { type: [invoiceLineSchema], default: [] },
    parts: { type: [invoiceLineSchema], default: [] },
    laborCost: { type: Number, default: 0, min: 0 },

    // Every one of these is computed server-side in invoiceService — never trusted from the client.
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    taxPercent: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },

    amountPaid: { type: Number, default: 0, min: 0 },
    balanceDue: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'unpaid', index: true },

    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, default: null },
    notes: { type: String, default: '' },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

invoiceSchema.index({ workshopId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ workshopId: 1, customerId: 1, createdAt: -1 });
invoiceSchema.index({ workshopId: 1, paymentStatus: 1 });

export const INVOICE_PAYMENT_STATUSES = PAYMENT_STATUSES;
export default mongoose.model('Invoice', invoiceSchema);
