import { Appointment } from './appointment.model.js';
import { User } from '../../models/User.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { AppointmentSocketGateway } from './appointment.socket.js';
import { AvailabilityService } from './availability.service.js';
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
        mobile: `+91900000000${targetNames.indexOf(name)}`, 
        password: hashedPassword,
        role: ROLES.DESIGNER,
        isVerified: true
      });
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

export const getUpcoming = catchAsync(async (req, res) => {
  let query = {
    status: { $in: ['Confirmed', 'Pending Approval', 'Rescheduled'] },
    date: { $gte: new Date().toISOString().split('T')[0] }
  };
  
  if (req.user.role === ROLES.CLIENT) {
    query.client = req.user._id;
  } else if (req.user.role === ROLES.DESIGNER) {
    query.designer = req.user._id;
  }

  const appointments = await Appointment.find(query)
    .populate('client', 'fullName email mobile')
    .populate('designer', 'fullName profileImage')
    .sort({ date: 1, timeSlot: 1 })
    .limit(5);

  return res.status(200).json(new ApiResponse(200, appointments, 'Upcoming appointments fetched'));
});

export const getAvailability = catchAsync(async (req, res) => {
  const { designerId, startDate, endDate } = req.query;
  const busyDates = await AvailabilityService.getBusyDates(designerId, startDate, endDate);
  return res.status(200).json(new ApiResponse(200, busyDates, 'Availability loaded'));
});

export const bookAppointment = catchAsync(async (req, res) => {
  const { designerId, type, date, timeSlot, requirements } = req.body;

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

  AppointmentSocketGateway.emitCreated(populatedAppt);
  AppointmentSocketGateway.emitAvailabilityUpdated(designerId);

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

  AppointmentSocketGateway.emitUpdated(populatedAppt);
  if (status === 'Cancelled') {
    AppointmentSocketGateway.emitAvailabilityUpdated(appointment.designer);
  }

  return res.status(200).json(new ApiResponse(200, populatedAppt, `Appointment marked as ${status}`));
});

export const rescheduleAppointment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { date, timeSlot } = req.body;

  const appointment = await Appointment.findById(id);
  if (!appointment) throw new ApiError(404, 'Appointment not found');

  const existing = await Appointment.findOne({ 
    designer: appointment.designer, 
    date, 
    timeSlot, 
    status: { $in: ['Confirmed', 'Pending Approval'] },
    _id: { $ne: id }
  });

  if (existing) {
    throw new ApiError(409, 'This time slot is no longer available for this designer.');
  }

  appointment.date = date;
  appointment.timeSlot = timeSlot;
  appointment.status = 'Rescheduled'; 
  await appointment.save();

  const populatedAppt = await Appointment.findById(appointment._id)
    .populate('client', 'fullName email')
    .populate('designer', 'fullName profileImage');

  AppointmentSocketGateway.emitUpdated(populatedAppt);
  AppointmentSocketGateway.emitAvailabilityUpdated(appointment.designer);

  return res.status(200).json(new ApiResponse(200, populatedAppt, 'Appointment rescheduled successfully.'));
});

export const getAnalytics = catchAsync(async (req, res) => {
  const total = await Appointment.countDocuments();
  const pending = await Appointment.countDocuments({ status: 'Pending Approval' });
  const completed = await Appointment.countDocuments({ status: 'Completed' });
  const noShows = await Appointment.countDocuments({ status: 'No Show' });
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = await Appointment.countDocuments({ date: todayStr });

  return res.status(200).json(new ApiResponse(200, {
    total,
    pending,
    completed,
    noShows,
    todayAppointments
  }, 'Analytics fetched'));
});
