import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  paymentId: String,
  signature: String,
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['Created', 'Paid', 'Failed', 'Refunded'],
    default: 'Created'
  },
  milestoneName: {
    type: String,
    required: true
  },
  refundId: String,
  invoiceUrl: String
}, {
  timestamps: true
});

paymentSchema.index({ client: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);
