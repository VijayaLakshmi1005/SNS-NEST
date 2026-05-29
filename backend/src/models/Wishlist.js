import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  designs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Design'
  }],
  collections: [{
    name: {
      type: String,
      required: true
    },
    designs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Design'
    }]
  }]
}, {
  timestamps: true
});

export const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);
