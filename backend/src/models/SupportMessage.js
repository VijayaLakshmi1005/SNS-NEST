import mongoose from 'mongoose';

const supportMessageSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupportTicket',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String
  },
  attachments: [{
    url: { type: String },
    public_id: { type: String },
    resource_type: { type: String },
    format: { type: String },
    original_filename: { type: String }
  }],
  isInternalNote: {
    type: Boolean,
    default: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupportMessage'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  reactions: [{
    emoji: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, {
  timestamps: true
});

supportMessageSchema.index({ ticket: 1, createdAt: 1 });

export const SupportMessage = mongoose.models.SupportMessage || mongoose.model('SupportMessage', supportMessageSchema);
