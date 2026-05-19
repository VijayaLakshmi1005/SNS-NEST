import mongoose from 'mongoose';

// 1. Collection Schema
const collectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800'
  }
}, {
  timestamps: true
});

// 2. SavedDesign Schema (acting as custom user design inspirations)
const savedDesignSchema = new mongoose.Schema({
  roomType: {
    type: String, // Kitchen, Bedroom, Living Room, Office, Wardrobe, Bathroom
    required: true
  },
  style: {
    type: String, // Modern, Luxury, Scandinavian, Minimal, Contemporary
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  designerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

// 3. Wishlist Schema
const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  designId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SavedDesign',
    required: true
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

wishlistSchema.index({ userId: 1, designId: 1, collectionId: 1 }, { unique: true });

export const Collection = mongoose.model('Collection', collectionSchema);
export const SavedDesign = mongoose.model('SavedDesign', savedDesignSchema);
export const WishlistItem = mongoose.model('WishlistItem', wishlistSchema);
