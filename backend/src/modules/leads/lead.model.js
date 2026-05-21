import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  mobile: { type: String, trim: true },
  city: { type: String, trim: true },
  
  source: {
    type: String,
    enum: ['Organic', 'Google Ads', 'Instagram', 'Referral', 'AI Visualizer', 'WhatsApp', 'Consultation CTA', 'Other'],
    default: 'Organic'
  },
  
  status: {
    type: String,
    enum: ['New Lead', 'Contacted', 'Interested', 'Consultation Scheduled', 'Proposal Sent', 'Negotiation', 'Converted', 'Closed Lost'],
    default: 'New Lead'
  },
  
  budget: { type: Number, default: 0 },
  propertyType: { type: String, trim: true },
  preferredStyle: { type: String, trim: true },
  requirements: { type: String, trim: true },
  
  probabilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 10
  },
  
  aiVisualizerUsage: {
    generationsCount: { type: Number, default: 0 },
    stylesExplored: [String]
  },
  
  followUpDate: { type: Date },
  
  assignedToAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedToDesigner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designer'
  },
  
  notes: String
}, {
  timestamps: true
});

leadSchema.index({ status: 1 });
leadSchema.index({ probabilityScore: -1 });

export const LeadModular = mongoose.models.LeadModular || mongoose.model('LeadModular', leadSchema);
