import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true
  },
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
  category: {
    type: String,
    enum: ['General', 'Project', 'Payment', 'Consultation', 'Technical', 'AI Visualizer', 'Catalog', 'Designer'],
    default: 'General'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In-Progress', 'Pending Client', 'Resolved', 'Closed', 'Escalated'],
    default: 'Open'
  },
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedDesigner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  relatedPayment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  slaDeadline: {
    type: Date
  },
  escalationLevel: {
    type: Number,
    default: 0 // 0=None, 1=Level1, 2=Level2, 3=Management
  },
  tags: [{
    type: String,
    trim: true
  }],
  timeline: [{
    action: { type: String, required: true },
    description: { type: String },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  satisfactionRating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String
  }
}, {
  timestamps: true
});

supportTicketSchema.pre('save', async function(next) {
  if (this.isNew && !this.ticketNumber) {
    const count = await mongoose.model('SupportTicket').countDocuments();
    this.ticketNumber = `TKT-${new Date().getFullYear()}-${String(count + 1000).padStart(4, '0')}`;
  }
  next();
});

supportTicketSchema.index({ client: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ ticketNumber: 1 });
supportTicketSchema.index({ assignedAdmin: 1 });
supportTicketSchema.index({ assignedDesigner: 1 });

export const SupportTicket = mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema);
