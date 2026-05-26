import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectModular',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['Todo', 'In Progress', 'In Review', 'Completed'],
    default: 'Todo'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Could be Designer, Admin, etc.
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

export const ProjectTask = mongoose.models.ProjectTask || mongoose.model('ProjectTask', taskSchema);
