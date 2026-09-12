import mongoose from 'mongoose';

const ROLES = ['customer', 'receptionist', 'mechanic', 'admin'];

const userSchema = new mongoose.Schema(
  {
    // Firebase Authentication owns the credential; this only mirrors identity.
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true, default: '' },
    role: { type: String, enum: ROLES, required: true, default: 'customer' },
    // Not required for a global admin managing multiple workshops.
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', default: null, index: true },
    avatar: { type: String, default: null }, // Cloudinary secure_url
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.index({ workshopId: 1, role: 1 });

// Non-customer roles must always belong to a workshop.
// Note: Mongoose 9 dropped support for callback-style (`next()`) middleware —
// hooks are called with zero arguments now; throw an Error to reject instead.
userSchema.pre('validate', function guardWorkshopScoping() {
  if (this.role !== 'customer' && this.role !== 'admin' && !this.workshopId) {
    throw new Error(`Users with role "${this.role}" must have a workshopId.`);
  }
});

export const USER_ROLES = ROLES;
export default mongoose.model('User', userSchema);
