import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['general', 'brakes', 'engine', 'electrical', 'fluids', 'bodywork', 'tires', 'other'],
      default: 'general',
    },
    durationMinutes: { type: Number, required: true, min: 5, default: 60 },
    price: { type: Number, required: true, min: 0 },
    estimatedLaborCost: { type: Number, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ workshopId: 1, isActive: 1 });
serviceSchema.index({ workshopId: 1, name: 1 });

export default mongoose.model('Service', serviceSchema);
