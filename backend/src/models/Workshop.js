import mongoose from 'mongoose';

const workingHoursSchema = new mongoose.Schema(
  {
    day: { type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], required: true },
    open: { type: String, default: '09:00' }, // "HH:mm" 24h
    close: { type: String, default: '18:00' },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const workshopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    logo: { type: String, default: null }, // Cloudinary secure_url
    address: {
      line1: String, city: String, state: String, country: String, postalCode: String,
    },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    workingHours: { type: [workingHoursSchema], default: [] },
    settings: {
      appointmentStepMinutes: { type: Number, default: 30 },
      defaultServiceDurationMinutes: { type: Number, default: 60 },
      taxPercent: { type: Number, default: 0, min: 0, max: 100 },
      currency: { type: String, default: 'PKR' },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

workshopSchema.index({ isActive: 1 });

export default mongoose.model('Workshop', workshopSchema);
