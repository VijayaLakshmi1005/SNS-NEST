import mongoose from 'mongoose';

// 1. Milestone Schema
const milestoneSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'current', 'completed'],
    default: 'pending'
  },
  completionDate: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  },
  delayed: {
    type: Boolean,
    default: false
  },
  delayReason: {
    type: String,
    default: ''
  },
  originalDate: {
    type: Date
  },
  revisedDate: {
    type: Date
  }
}, {
  timestamps: true
});

// 2. Activity Schema
const activitySchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  type: {
    type: String,
    enum: ['milestone', 'procurement', 'upload', 'delay', 'team'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByName: {
    type: String,
    default: 'System Designer'
  }
}, {
  timestamps: true
});

// 3. SiteUpdate Schema
const siteUpdateSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  caption: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedByName: {
    type: String,
    default: 'John Designer'
  }
}, {
  timestamps: true
});

// 4. Procurement Schema
const procurementSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'ordered', 'shipped', 'delivered'],
    default: 'pending'
  },
  deliveryForecast: {
    type: Date
  },
  delayReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// 5. Extend Project Schema locally with dynamic tracking metrics or Room Progress (Optional Sub-Model)
const projectProgressSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    unique: true
  },
  overallProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  roomProgress: [{
    name: { type: String, required: true },
    progress: { type: Number, min: 0, max: 100, default: 0 }
  }],
  team: {
    designer: {
      name: { type: String, default: 'John Designer' },
      email: { type: String, default: 'designer@snsnest.com' },
      mobile: { type: String, default: '9876543210' },
      profileImage: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200' }
    },
    projectManager: {
      name: { type: String, default: 'Anand Kumar' },
      mobile: { type: String, default: '9123456789' }
    },
    installationLead: {
      name: { type: String, default: 'Ramesh Singh' },
      mobile: { type: String, default: '9876541230' }
    }
  },
  documents: [{
    name: { type: String, required: true },
    category: { type: String, required: true }, // 'Floor Plan', 'Agreement', '3D Render', 'Invoice'
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export const Milestone = mongoose.model('Milestone', milestoneSchema);
export const Activity = mongoose.model('Activity', activitySchema);
export const SiteUpdate = mongoose.model('SiteUpdate', siteUpdateSchema);
export const Procurement = mongoose.model('Procurement', procurementSchema);
export const ProjectProgress = mongoose.model('ProjectProgress', projectProgressSchema);
