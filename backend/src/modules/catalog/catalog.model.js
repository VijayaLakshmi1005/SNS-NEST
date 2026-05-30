import mongoose from 'mongoose';

const catalogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  
  type: {
    type: String,
    required: true
  },
  
  format: { type: String }, // Service, Product, Concept, Package
  
  tier: { type: String }, // Basic, Standard, Premium, Luxury
  
  category: { type: String, required: true, index: true },
  subCategory: { type: String },
  
  description: { type: String, required: true },
  
  pricing: {
    basePrice: { type: Number, required: true },
    maxPrice: { type: Number },
    currency: { type: String, default: 'INR' },
    isCustomQuote: { type: Boolean, default: false }
  },
  
  // AI Extracted / Curated Metadata
  styles: [{ type: String, index: true }], // e.g., Minimalist, Luxury
  roomTypes: [{ type: String, index: true }], // e.g., Living Room, Kitchen
  materials: [{ type: String }],
  colorPalette: [{ type: String }],
  
  // Media Gallery (From Upload Studio)
  images: [{
    url: String,
    publicId: String,
    isPrimary: { type: Boolean, default: false },
    extractedText: String // OCR results from PDF/Image
  }],
  
  documentUrl: String, // Original PDF/DOC
  
  // Engagement & Realtime Stats
  stats: {
    views: { type: Number, default: 0 },
    wishlistSaves: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  
  // Vendors & Inventory (for Products)
  inventory: {
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock', 'Made to Order', 'Service'],
      default: 'Service'
    },
    stockCount: { type: Number, default: 0 }
  },
  
  designerRecommendations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designer'
  }],
  
  status: {
    type: String,
    enum: ['Active', 'Draft', 'Archived'],
    default: 'Active'
  },
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

catalogSchema.index({ 'stats.views': -1 });
catalogSchema.index({ 'stats.wishlistSaves': -1 });
catalogSchema.index({ status: 1 });

export const CatalogItem = mongoose.models.CatalogItem || mongoose.model('CatalogItem', catalogSchema);
