import mongoose from 'mongoose';

const revisionSchema = new mongoose.Schema({
  version: {
    type: Number,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  designerNotes: {
    type: String,
  },
  clientFeedback: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending Review', 'Approved', 'Revision Requested'],
    default: 'Pending Review'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const designerUploadSchema = new mongoose.Schema({
  designer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designer',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['2D Layout', '3D Render', 'Moodboard', 'Floor Plan', 'Other'],
    required: true
  },
  revisions: [revisionSchema],
  isFinalApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const DesignerUpload = mongoose.models.DesignerUpload || mongoose.model('DesignerUpload', designerUploadSchema);
