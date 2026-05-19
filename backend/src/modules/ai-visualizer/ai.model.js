import mongoose from 'mongoose';

const aiGenerationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalImage: {
    type: String,
    required: true
  },
  generatedImage: {
    type: String,
    required: true
  },
  style: {
    type: String,
    required: true
  },
  roomType: {
    type: String,
    required: true
  },
  wallColor: {
    type: String,
    default: ''
  },
  furnitureStyle: {
    type: String,
    default: ''
  },
  flooringType: {
    type: String,
    default: ''
  },
  lightingType: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

aiGenerationSchema.index({ user: 1 });

export const AIVisualizer = mongoose.model('AIVisualizer', aiGenerationSchema);
