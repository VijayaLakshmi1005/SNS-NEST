import mongoose from 'mongoose';

const designSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  images: [String],
  style: {
    type: String,
    required: true, // e.g. 'Scandinavian', 'Minimalist', 'Industrial'
    index: true
  },
  roomType: {
    type: String,
    required: true, // e.g. 'Living Room', 'Bedroom'
    index: true
  },
  budgetRange: {
    type: String,
    required: true // e.g. 'Essential', 'Premium', 'Luxury'
  },
  colorTheme: [String],
  materials: [String]
}, {
  timestamps: true
});

// Full-text index for fuzzy search
designSchema.index({ title: 'text', description: 'text', style: 'text' });

export const Design = mongoose.model('Design', designSchema);
