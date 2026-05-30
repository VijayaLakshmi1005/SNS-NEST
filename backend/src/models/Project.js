import mongoose from 'mongoose';
import { PROJECT_STATUS_LIST, PROJECT_STATUS } from '../constants/projectStatuses.js';

const timelineSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: PROJECT_STATUS_LIST,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  comments: String,
  completed: {
    type: Boolean,
    default: false
  }
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
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: PROJECT_STATUS_LIST,
    default: PROJECT_STATUS.CONSULTATION
  },
  timeline: [timelineSchema],
  sitePhotos: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  budget: {
    type: Number,
    required: true
  },
  projectType: {
    type: String,
    default: 'Residential Interior Design'
  },
  expectedCompletion: {
    type: Date
  },
  uploads: [{
    fileName: String,
    fileUrl: String,
    fileType: { type: String, enum: ['Floor Plan', '2D Layout', '3D Render', 'Material Board', 'Other'], default: 'Other' },
    status: { type: String, enum: ['Pending Approval', 'Approved', 'Rejected', 'Revision Requested', 'No Approval Needed'], default: 'Pending Approval' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
    feedback: String
  }]
}, {
  timestamps: true
});

projectSchema.index({ client: 1 });
projectSchema.index({ designer: 1 });
projectSchema.index({ status: 1 });

export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
