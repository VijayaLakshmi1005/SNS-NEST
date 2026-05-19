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
  }
}, {
  timestamps: true
});

projectSchema.index({ client: 1 });
projectSchema.index({ designer: 1 });
projectSchema.index({ status: 1 });

export const Project = mongoose.model('Project', projectSchema);
