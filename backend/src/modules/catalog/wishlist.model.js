import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [{
    catalogItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CatalogItem'
    },
    savedAt: { type: Date, default: Date.now },
    notes: String // Optional note from user why they liked it
  }]
}, { timestamps: true });

export const Wishlist = mongoose.models.CatalogWishlist || mongoose.model('CatalogWishlist', wishlistSchema);
