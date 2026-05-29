import mongoose from 'mongoose';

const estimateSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  homeSize: {
    type: Number,
    required: true // in sq ft
  },
  bhkType: {
    type: String,
    required: true // e.g. '1 BHK', '2 BHK', '3 BHK', '4+ BHK'
  },
  quality: {
    type: String,
    enum: ['essential', 'premium', 'luxury'],
    required: true
  },
  rooms: {
    type: Number,
    required: true
  },
  breakdown: {
    woodwork: Number,
    civil: Number,
    decor: Number,
    gst: Number
  },
  totalCost: {
    type: Number,
    required: true
  },
  pdfUrl: String
}, {
  timestamps: true
});

estimateSchema.index({ client: 1 });

export const Estimate = mongoose.models.Estimate || mongoose.model('Estimate', estimateSchema);
