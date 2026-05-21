import mongoose from 'mongoose';

export const LEAD_STATUS = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  INTERESTED: 'Interested',
  SCHEDULED: 'Consultation Scheduled',
  CONVERTED: 'Converted',
  CLOSED: 'Closed'
};
export const LEAD_STATUS_LIST = Object.values(LEAD_STATUS);

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  mobile: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    default: 'Website'
  },
  status: {
    type: String,
    enum: LEAD_STATUS_LIST,
    default: LEAD_STATUS.NEW
  },
  estimatedValue: {
    type: Number,
    default: 0
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String
}, {
  timestamps: true
});

leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });

export const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);
