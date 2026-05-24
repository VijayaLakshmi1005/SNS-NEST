import mongoose from 'mongoose';

const availabilitySlotSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  slots: {
    type: [String],
    default: ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM']
  }
});

const designerSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false // Optional for now to avoid breaking existing data
  },
  name: {
    type: String,
    required: false,
    trim: true
  },
  email: {
    type: String,
    required: false,
    unique: true,
    lowercase: true,
    trim: true
  },
  phoneNumber: {
    type: String
  },
  specialization: {
    type: String,
    default: 'General'
  },
  experience: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 4.8,
    min: 1,
    max: 5
  },
  profileImage: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Busy', 'Available', 'In Consultation', 'Offline', 'On Leave', 'Suspended', 'Inactive'],
    default: 'Available'
  },
  activeProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  completedProjects: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  pendingCommissions: {
    type: Number,
    default: 0
  },
  consultationTypes: {
    type: [String],
    enum: ['Video Call', 'Offline Meeting'],
    default: ['Video Call', 'Offline Meeting']
  },
  availability: [availabilitySlotSchema],
  workloadPercentage: { type: Number, default: 0 },
  consultationsToday: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const Designer = mongoose.models.Designer || mongoose.model('Designer', designerSchema);
