import mongoose from 'mongoose';

const leadActivitySchema = new mongoose.Schema({
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeadModular',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Who performed the action (Admin/Designer). Can be null if system/lead action
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  type: {
    type: String,
    enum: ['status_change', 'call', 'message', 'follow_up', 'consultation', 'ai_usage', 'system', 'proposal', 'conversion', 'designer_assigned'],
    default: 'system'
  }
}, {
  timestamps: true
});

export const LeadActivity = mongoose.models.LeadActivity || mongoose.model('LeadActivity', leadActivitySchema);
