import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['user_registered', 'payment_received', 'project_milestone', 'lead_converted', 'design_uploaded', 'system'],
    default: 'system'
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    description: 'ID of the related document (user, project, lead, etc)'
  }
}, {
  timestamps: true
});

activitySchema.index({ createdAt: -1 });

export const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
