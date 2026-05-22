import mongoose from 'mongoose';

const cmsSchema = new mongoose.Schema({
  page: { type: String, required: true, unique: true }, // e.g., 'homepage'
  sections: [{
    sectionId: { type: String, required: true }, // e.g., 'hero', 'testimonials'
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    content: {
      title: String,
      subtitle: String,
      ctaText: String,
      ctaLink: String,
      mediaUrl: String,
      overlayOpacity: { type: Number, default: 0.5 },
      items: [mongoose.Schema.Types.Mixed] // Flexible array for testimonials/faqs
    }
  }],
  seo: {
    title: String,
    description: String,
    keywords: [String],
    ogImage: String
  },
  lastPublishedAt: { type: Date }
}, { timestamps: true });

export const CmsPage = mongoose.models.CmsPage || mongoose.model('CmsPage', cmsSchema);
