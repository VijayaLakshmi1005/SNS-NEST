import mongoose from 'mongoose';

const procurementSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  projectName: { type: String }, // e.g., 'Luxury Villa - Plot 42'
  items: [{
    name: String,
    quantity: Number,
    unitPrice: Number
  }],
  totalAmount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Requested', 'Processing', 'Dispatched', 'In Transit', 'Delivered', 'Cancelled'], 
    default: 'Requested' 
  },
  paymentStatus: { type: String, enum: ['Pending', 'Partial', 'Paid'], default: 'Pending' },
  expectedDeliveryDate: { type: Date },
}, { timestamps: true });

if (mongoose.models.Procurement) {
  delete mongoose.models.Procurement;
}
export default mongoose.model('Procurement', procurementSchema);
