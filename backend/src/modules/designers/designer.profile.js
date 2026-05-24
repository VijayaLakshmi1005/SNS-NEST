import mongoose from 'mongoose';

const designerProfileSchema = new mongoose.Schema({
  designer: { type: mongoose.Schema.Types.ObjectId, ref: 'Designer', required: true, unique: true },
  bio: { type: String, default: '' },
  expertise: [{ type: String }],
  certifications: [{ type: String }],
  yearsOfExperience: { type: Number, default: 0 },
  socialLinks: {
    instagram: String,
    linkedin: String,
    portfolioUrl: String
  },
  designStyles: [{ type: String }]
}, { timestamps: true });

export const DesignerProfile = mongoose.models.DesignerProfile || mongoose.model('DesignerProfile', designerProfileSchema);
