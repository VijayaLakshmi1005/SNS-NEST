import mongoose from 'mongoose';

const moodboardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, required: true },
  description: String,
  items: [{
    catalogItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CatalogItem'
    },
    position: {
      x: Number,
      y: Number,
      scale: Number
    }
  }],
  status: {
    type: String,
    enum: ['Private', 'Shared', 'Client_Approved'],
    default: 'Private'
  }
}, { timestamps: true });

export const Moodboard = mongoose.models.Moodboard || mongoose.model('Moodboard', moodboardSchema);
