import { Appointment } from './appointment.model.js';
import { User } from '../../models/User.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { getIO } from '../../config/socket.js';
import { ROLES } from '../../constants/roles.js';
import bcrypt from 'bcryptjs';

// Seed specific designers if they don't exist
const ensureDesignersExist = async () => {
  const targetNames = ['Sreenivasulu', 'Narendra', 'Sendil'];
  
  for (const name of targetNames) {
    const exists = await User.findOne({ fullName: name, role: ROLES.DESIGNER });
    if (!exists) {
      const email = `${name.toLowerCase()}@sns-nest.com`;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Designer@123', salt);
      
      const newDesigner = new User({
        fullName: name,
        email,
        mobile: `+91900000000${targetNames.indexOf(name)}`, // unique dummy mobile
        password: hashedPassword,
        role: ROLES.DESIGNER,
        isVerified: true
      });
      // Skip the save hook since we pre-hashed
      await User.collection.insertOne(newDesigner);
    }
  }
};

export const getDesigners = catchAsync(async (req, res) => {
  await ensureDesignersExist();
  const designers = await User.find({ role: ROLES.DESIGNER }).select('fullName profileImage email');
  return res.status(200).json(new ApiResponse(200, designers, 'Designers fetched'));
});

export const getAppointments = catchAsync(async (req, res) => {
  let query = {};
  if (req.user.role === ROLES.CLIENT) {
    query.client = req.user._id;
  } else if (req.user.role === ROLES.DESIGNER) {
    query.designer = req.user._id;
  }
  
  const appointments = await Appointment.find(query)
    .populate('client', 'fullName email mobile')
    .populate('designer', 'fullName profileImage')
    .sort({ date: 1, timeSlot: 1 });

  return res.status(200).json(new ApiResponse(200, appointments, 'Appointments fetched'));
});

export const bookAppointment = catchAsync(async (req, res) => {
  const { designerId, type, date, timeSlot, requirements } = req.body;

  // Conflict Detection
  const existing = await Appointment.findOne({ 
    designer: designerId, 
    date, 
    timeSlot, 
    status: { $in: ['Confirmed', 'Pending Approval'] } 
  });

  if (existing) {
    throw new ApiError(409, 'This time slot is no longer available for this designer.');
  }

  const appointment = await Appointment.create({
    client: req.user._id,
    designer: designerId,
    type,
    date,
    timeSlot,
    requirements
  });

  const populatedAppt = await Appointment.findById(appointment._id)
    .populate('client', 'fullName email')
    .populate('designer', 'fullName profileImage');

  try {
    const io = getIO();
    io.emit('appointmentCreated', populatedAppt);
  } catch(err) {}

  return res.status(201).json(new ApiResponse(201, populatedAppt, 'Consultation booked successfully. Pending approval.'));
});

export const updateAppointmentStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, meetingLink } = req.body;

  const appointment = await Appointment.findById(id);
  if (!appointment) throw new ApiError(404, 'Appointment not found');

  appointment.status = status;
  if (meetingLink) appointment.meetingLink = meetingLink;
  
  await appointment.save();

  const populatedAppt = await Appointment.findById(appointment._id)
    .populate('client', 'fullName email')
    .populate('designer', 'fullName profileImage');

  try {
    const io = getIO();
    io.emit('appointmentUpdated', populatedAppt);
  } catch(err) {}

  return res.status(200).json(new ApiResponse(200, populatedAppt, `Appointment marked as ${status}`));
});
