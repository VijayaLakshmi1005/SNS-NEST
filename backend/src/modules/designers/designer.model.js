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
  name: {
    type: String,
    required: [true, 'Designer name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Designer email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  specialization: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  bio: {
    type: String,
    required: true
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
    enum: ['Active', 'Busy', 'Inactive'],
    default: 'Active'
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
  availability: [availabilitySlotSchema]
}, {
  timestamps: true
});

export const Designer = mongoose.models.Designer || mongoose.model('Designer', designerSchema);
