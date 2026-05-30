import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLE_LIST, ROLES } from '../constants/roles.js';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  profileImage: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    enum: ROLE_LIST,
    default: ROLES.CLIENT
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isDesigner: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  internalNotes: [{
    note: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  // CRM Specific Fields
  clientStatus: {
    type: String,
    enum: ['New Lead', 'Active Client', 'Consultation Ongoing', 'Project Active', 'High Priority', 'VIP', 'Inactive', 'Blocked', 'FOLLOW-UP'],
    default: 'New Lead'
  },
  assignedDesigner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  crmTags: [{
    type: String,
    trim: true
  }],
  clientHealthScore: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  aiEngagementScore: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  refreshToken: {
    type: String
  }
}, {
  timestamps: true
});
// Password hashing hook
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to check password validity
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
