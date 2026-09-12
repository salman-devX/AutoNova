import mongoose from 'mongoose';

const partSchema = new mongoose.Schema(
  {
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true, index: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true, uppercase: true },
    category: { type: String, trim: true, default: 'general' },
    supplier: { type: String, trim: true, default: '' },
    purchasePrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    minimumStockLevel: { type: Number, required: true, min: 0, default: 5 },
    location: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

partSchema.index({ workshopId: 1, sku: 1 }, { unique: true });
partSchema.index({ workshopId: 1, name: 1 });

// Virtual, computed status for UI convenience (Active / Low Stock / Out of Stock).
partSchema.virtual('stockStatus').get(function computeStockStatus() {
  if (this.quantity <= 0) return 'out_of_stock';
  if (this.quantity <= this.minimumStockLevel) return 'low_stock';
  return 'active';
});
partSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Part', partSchema);
