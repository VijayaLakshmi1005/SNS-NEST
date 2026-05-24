import mongoose from 'mongoose';

const crmActivitySchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actionType: { 
    type: String, 
    enum: [
      'CONSULTATION_BOOKED', 'INSPIRATION_UPLOADED', 'AI_VISUALIZER_USED',
      'PAYMENT_COMPLETED', 'DESIGNER_ASSIGNED', 'SUPPORT_TICKET_RAISED',
      'QUOTATION_APPROVED', 'PROJECT_MILESTONE_UPDATED', 'STATUS_CHANGED',
      'MESSAGE_SENT'
    ],
    required: true
  },
  description: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed }, // Arbitrary data like ticketId, paymentId
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin or system who performed the action
  timestamp: { type: Date, default: Date.now }
});

const crmNoteSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  note: { type: String, required: true },
  isPinned: { type: Boolean, default: false },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const CRMActivity = mongoose.models.CRMActivity || mongoose.model('CRMActivity', crmActivitySchema);
export const CRMNote = mongoose.models.CRMNote || mongoose.model('CRMNote', crmNoteSchema);
