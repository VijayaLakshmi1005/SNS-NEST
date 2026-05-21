import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Delayed'], default: 'Pending' },
  dueDate: { type: Date },
  completedAt: { type: Date },
  comments: String
});

const uploadSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ['2D Layout', '3D Render', 'Contract', 'Invoice', 'Other'], default: 'Other' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Pending Approval', 'Approved', 'Revision Requested', 'No Approval Needed'], default: 'No Approval Needed' },
  clientFeedback: String,
  uploadedAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  designer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designer', // Can be User depending on role
  },
  status: {
    type: String,
    enum: ['Draft', 'Consultation', 'In Design', 'Awaiting Approval', 'Procurement', 'Execution', 'Installation', 'Completed', 'Delayed', 'Cancelled'],
    default: 'Consultation'
  },
  budget: {
    type: Number,
    default: 0
  },
  milestones: [milestoneSchema],
  uploads: [uploadSchema],
  startDate: { type: Date, default: Date.now },
  estimatedCompletion: { type: Date },
  siteUpdates: [{
    imageUrl: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  escalation: {
    isEscalated: { type: Boolean, default: false },
    reason: String
  }
}, {
  timestamps: true
});

export const ProjectModular = mongoose.models.ProjectModular || mongoose.model('ProjectModular', projectSchema);
