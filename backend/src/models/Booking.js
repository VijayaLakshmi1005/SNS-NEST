import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  designer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['Video', 'Offline'],
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  roomType: {
    type: String,
    required: true
  },
  title: String,
  meetingLink: String,
  notes: String
}, {
  timestamps: true
});

bookingSchema.index({ client: 1 });
bookingSchema.index({ designer: 1, dateTime: 1 });

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
