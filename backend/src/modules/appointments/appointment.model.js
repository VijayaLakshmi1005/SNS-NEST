import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  designer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['Video Consultation', 'Home Visit', 'Office Meeting', 'Design Discussion', 'Budget Consultation'],
    required: true
  },
  date: { type: String, required: true }, // Format YYYY-MM-DD
  timeSlot: { type: String, required: true }, // e.g. "10:00 AM - 11:00 AM"
  status: {
    type: String,
    enum: ['Requested', 'Pending Approval', 'Confirmed', 'Rescheduled', 'Ongoing', 'Completed', 'Cancelled', 'No Show'],
    default: 'Pending Approval'
  },
  requirements: {
    roomType: String,
    budget: String,
    preferredStyle: String,
    location: String,
    notes: String
  },
  meetingLink: { type: String }, // For video consultations
  adminNotes: { type: String }
}, { timestamps: true });

// Ensure a designer cannot be double booked for the exact same date and timeSlot
appointmentSchema.index({ designer: 1, date: 1, timeSlot: 1 }, { unique: true, partialFilterExpression: { status: { $in: ['Confirmed', 'Pending Approval'] } } });

export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
