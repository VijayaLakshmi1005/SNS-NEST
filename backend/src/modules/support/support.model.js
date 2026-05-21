import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  clientName: { type: String, required: true },
  subject: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Project Issue', 'Payment', 'Appointment', 'Design Revision', 'Technical', 'Other'],
    default: 'Other'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Waiting for Client', 'Escalated', 'Resolved', 'Closed'],
    default: 'Open'
  }
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['client', 'admin', 'designer', 'support'], required: true },
  message: { type: String, required: true },
  isInternalNote: { type: Boolean, default: false }
}, { timestamps: true });

// Singleton pattern to prevent Nodemon overwrite crashes
export const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
export const SupportMessage = mongoose.models.SupportMessage || mongoose.model('SupportMessage', messageSchema);
