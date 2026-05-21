import mongoose from 'mongoose';

const projectActivitySchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectModular',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
    enum: ['milestone', 'upload', 'status_change', 'approval', 'system', 'message'],
    default: 'system'
  }
}, {
  timestamps: true
});

export const ProjectActivity = mongoose.models.ProjectActivity || mongoose.model('ProjectActivity', projectActivitySchema);
