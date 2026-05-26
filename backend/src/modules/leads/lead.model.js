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
  
  // Smart Qualification & AI Scoring
  probabilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 10
  },
  aiQualificationNotes: { type: String, default: 'Lead just entered pipeline. Needs contact to evaluate intent.' },
  
  aiVisualizerUsage: {
    generationsCount: { type: Number, default: 0 },
    stylesExplored: [String]
  },
  
  // Engagement & Automation Tracking
  lastContactedAt: { type: Date },
  followUpDate: { type: Date },
  responseTimeHours: { type: Number, default: 0 },
  
  // References
  assignedToAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedToDesigner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designer'
  },
  convertedToClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  convertedToProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectModular'
  },
  
  notes: String
}, {
  timestamps: true
});

leadSchema.index({ status: 1 });
leadSchema.index({ probabilityScore: -1 });

export const LeadModular = mongoose.models.LeadModular || mongoose.model('LeadModular', leadSchema);
