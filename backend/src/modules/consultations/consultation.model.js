import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  designer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designer',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  consultationType: {
    type: String,
    enum: ['Video Call', 'Offline Meeting'],
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  meetingLink: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

consultationSchema.index({ user: 1 });
consultationSchema.index({ designer: 1 });
consultationSchema.index({ date: 1, time: 1 });

export const Consultation = mongoose.model('Consultation', consultationSchema);
