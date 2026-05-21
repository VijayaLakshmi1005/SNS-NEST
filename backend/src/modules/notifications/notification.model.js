import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Nullable for global admin broadcasts
  roleScope: { type: String, enum: ['admin', 'client', 'designer', 'all'], default: 'admin' },
  type: { 
    type: String, 
    enum: ['Payment', 'Project', 'Support', 'Lead', 'Appointment', 'System'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  link: { type: String }, // e.g., '/admin/support'
  createdAt: { type: Date, default: Date.now, expires: 2592000 } // 30 days TTL (2592000 seconds)
});

// Singleton pattern to prevent Nodemon overwrite crashes
export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
