import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    // A customer may have interacted with multiple workshops over time; primaryWorkshopId
    // is used for default scoping/searches, while individual records (vehicles, appointments)
    // each carry their own workshopId for tenant isolation.
    primaryWorkshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true, index: true },
    phone: { type: String, trim: true, default: '' },
    address: {
      line1: String, city: String, state: String, country: String, postalCode: String,
    },
    emergencyContact: { name: String, phone: String },
    status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

customerSchema.index({ primaryWorkshopId: 1, status: 1 });

export default mongoose.model('Customer', customerSchema);
