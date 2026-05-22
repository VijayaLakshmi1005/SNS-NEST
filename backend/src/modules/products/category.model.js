import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  coverImage: String,
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory',
    default: null
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const ProductCategory = mongoose.models.ProductCategory || mongoose.model('ProductCategory', categorySchema);
