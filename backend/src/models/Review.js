import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  designer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  images: [String]
}, {
  timestamps: true
});

reviewSchema.index({ designer: 1 });

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
