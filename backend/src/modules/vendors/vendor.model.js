import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  category: { type: String, required: true }, // e.g., 'Furniture', 'Lighting', 'Flooring'
  contactPerson: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  gstNumber: { type: String },
  address: { type: String },
  materialsSupplied: [{ type: String }],
  status: { type: String, enum: ['Active', 'Inactive', 'Blacklisted'], default: 'Active' },
  rating: { type: Number, default: 5 },
  completedDeliveries: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);
