import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  sku: { type: String, required: true, unique: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory',
    required: true
  },
  
  description: { type: String, required: true },
  
  basePrice: { type: Number, required: true },
  discountPrice: { type: Number },
  currency: { type: String, default: 'INR' },
  
  dimensions: {
    length: String,
    width: String,
    height: String,
    unit: { type: String, default: 'mm' }
  },
  
  materials: [{ type: String }],
  style: { type: String }, // e.g. Scandinavian, Minimalist
  
  variants: [{
    name: String, // e.g. "Color", "Finish"
    options: [{
      value: String, // e.g. "Beige Fabric", "Matte Black"
      priceModifier: { type: Number, default: 0 },
      skuSuffix: String,
      image: String
    }]
  }],
  
  images: [{
    url: String,
    isPrimary: { type: Boolean, default: false }
  }],
  
  inventory: {
    inStock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock', 'Made to Order'],
      default: 'In Stock'
    }
  },
  
  status: {
    type: String,
    enum: ['Active', 'Draft', 'Archived'],
    default: 'Active'
  },
  
  stats: {
    views: { type: Number, default: 0 },
    wishlistSaves: { type: Number, default: 0 },
    sales: { type: Number, default: 0 }
  }
}, { timestamps: true });

productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ 'inventory.status': 1 });

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
