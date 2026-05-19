import mongoose from 'mongoose';

const estimatorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  propertyType: {
    type: String,
    enum: ['Apartment', 'Villa', 'Office'],
    required: true
  },
  bhkType: {
    type: String,
    enum: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Villa', 'Office'],
    required: true
  },
  squareFeet: {
    type: Number,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  rooms: [{
    name: {
      type: String,
      required: true
    },
    cost: {
      type: Number,
      required: true
    }
  }],
  packageType: {
    type: String,
    enum: ['Essential', 'Premium', 'Luxury'],
    required: true
  },
  materialQuality: {
    type: String,
    enum: ['Basic', 'Standard', 'Premium', 'Luxury'],
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  gst: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  emiDetails: {
    downPayment: { type: Number, default: 0 },
    tenureMonths: { type: Number, default: 12 },
    interestRate: { type: Number, default: 10.5 },
    monthlyEmi: { type: Number, default: 0 },
    totalPayable: { type: Number, default: 0 }
  },
  pdfUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

estimatorSchema.index({ userId: 1 });

export const Estimator = mongoose.model('Estimator', estimatorSchema);
