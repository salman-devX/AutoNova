import mongoose from 'mongoose';

const TYPES = ['purchase', 'sale', 'service_usage', 'adjustment', 'return'];

const inventoryTransactionSchema = new mongoose.Schema(
  {
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true, index: true },
    partId: { type: mongoose.Schema.Types.ObjectId, ref: 'Part', required: true, index: true },
    type: { type: String, enum: TYPES, required: true },
    quantity: { type: Number, required: true }, // positive = stock in, negative = stock out
    previousQuantity: { type: Number, required: true, min: 0 },
    newQuantity: { type: Number, required: true, min: 0 },
    reason: { type: String, default: '' },
    serviceOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceOrder', default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

inventoryTransactionSchema.index({ workshopId: 1, partId: 1, createdAt: -1 });
inventoryTransactionSchema.index({ workshopId: 1, serviceOrderId: 1 });

export const INVENTORY_TRANSACTION_TYPES = TYPES;
export default mongoose.model('InventoryTransaction', inventoryTransactionSchema);
