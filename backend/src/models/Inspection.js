import mongoose from 'mongoose';

const RATINGS = ['good', 'needs_attention', 'critical'];
const CATEGORIES = ['engine', 'brakes', 'tires', 'battery', 'lights', 'suspension', 'fluids', 'exterior', 'interior'];

const inspectionItemSchema = new mongoose.Schema(
  {
    category: { type: String, enum: CATEGORIES, required: true },
    rating: { type: String, enum: RATINGS, required: true },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const inspectionSchema = new mongoose.Schema(
  {
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true, index: true },
    serviceOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceOrder', required: true, index: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    mechanicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mechanic', required: true },

    items: { type: [inspectionItemSchema], default: [] },
    recommendations: { type: String, default: '' },
    // Cloudinary secure_urls only — never raw image bytes in MongoDB.
    photos: { type: [{ url: String, publicId: String, caption: String }], default: [] },

    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

inspectionSchema.index({ workshopId: 1, serviceOrderId: 1 });

export const INSPECTION_RATINGS = RATINGS;
export const INSPECTION_CATEGORIES = CATEGORIES;
export default mongoose.model('Inspection', inspectionSchema);
