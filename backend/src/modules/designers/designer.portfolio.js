import mongoose from 'mongoose';

const portfolioItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['Render', 'Moodboard', 'FloorPlan', 'Other'], default: 'Other' },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const designerPortfolioSchema = new mongoose.Schema({
  designer: { type: mongoose.Schema.Types.ObjectId, ref: 'Designer', required: true, unique: true },
  items: [portfolioItemSchema]
}, { timestamps: true });

export const DesignerPortfolio = mongoose.models.DesignerPortfolio || mongoose.model('DesignerPortfolio', designerPortfolioSchema);
