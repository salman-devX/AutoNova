import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, min: 1950, max: new Date().getFullYear() + 1 },
    registrationNumber: { type: String, required: true, trim: true, uppercase: true },
    vin: { type: String, trim: true, uppercase: true, default: null },
    mileage: { type: Number, min: 0, default: 0 },
    color: { type: String, trim: true, default: '' },
    image: { type: String, default: null }, // Cloudinary secure_url
    notes: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Registration number must be unique *within a workshop*, not globally —
// the same physical plate format could coincidentally collide across tenants/regions.
vehicleSchema.index({ workshopId: 1, registrationNumber: 1 }, { unique: true });
vehicleSchema.index({ workshopId: 1, customerId: 1 });

export default mongoose.model('Vehicle', vehicleSchema);
