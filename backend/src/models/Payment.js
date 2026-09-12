import mongoose from 'mongoose';

const METHODS = ['cash', 'card', 'bank_transfer', 'online'];
const STATUSES = ['pending', 'completed', 'failed', 'refunded'];

const paymentSchema = new mongoose.Schema(
  {
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true, index: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    method: { type: String, enum: METHODS, required: true },
    status: { type: String, enum: STATUSES, default: 'completed' },
    referenceId: { type: String, default: '' }, // external gateway/transaction ID, when applicable
    notes: { type: String, default: '' },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

paymentSchema.index({ workshopId: 1, invoiceId: 1, createdAt: -1 });

export const PAYMENT_METHODS = METHODS;
export const PAYMENT_STATUSES = STATUSES;
export default mongoose.model('Payment', paymentSchema);
