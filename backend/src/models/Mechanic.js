import mongoose from 'mongoose';

const mechanicSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true, index: true },
    employeeId: { type: String, trim: true, default: '' },
    specializations: { type: [String], default: [] }, // e.g. ["engine", "brakes"]
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

mechanicSchema.index({ workshopId: 1, isActive: 1 });

export default mongoose.model('Mechanic', mechanicSchema);
