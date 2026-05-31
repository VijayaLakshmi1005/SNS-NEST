import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  selectedDesigns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wishlist' // Or catalog, assuming wishlist for now
  }],
  floorPlanUrl: {
    type: String,
    required: false
  },
  estimationDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  admin3DModelUrl: {
    type: String
  },
  pdfQuotationUrl: {
    type: String
  },
  finalQuotation: {
    type: Number
  },
  status: {
    type: String,
    enum: ['Pending Admin Review', 'Proposal Sent', 'Client Accepted', 'Rejected'],
    default: 'Pending Admin Review'
  },
  assignedDesigner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);
