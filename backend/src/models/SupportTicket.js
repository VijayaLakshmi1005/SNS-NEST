import mongoose from 'mongoose';

const ticketMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const supportTicketSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Open', 'In-Progress', 'Resolved'],
    default: 'Open'
  },
  messages: [ticketMessageSchema]
}, {
  timestamps: true
});

supportTicketSchema.index({ client: 1 });
supportTicketSchema.index({ status: 1 });

export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
