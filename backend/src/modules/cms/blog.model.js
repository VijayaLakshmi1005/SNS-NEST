import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true }, // Markdown or HTML
  excerpt: { type: String },
  coverImage: { type: String },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  categories: [{ type: String }],
  tags: [{ type: String }],
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Draft'
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  publishedAt: { type: Date },
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
  }
}, { timestamps: true });

blogSchema.index({ status: 1 });

export const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);
