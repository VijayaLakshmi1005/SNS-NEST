import { Consultation } from './consultation.model.js';
import { Designer } from '../designers/designer.model.js';
import { Notification } from '../../models/Notification.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { catchAsync } from '../../utils/catchAsync.js';

export const bookConsultation = catchAsync(async (req, res) => {
  const { designerId, date, time, consultationType, notes } = req.body;
  const userId = req.user._id;

  if (!designerId || !date || !time || !consultationType) {
    throw new ApiError(400, 'designerId, date, time, and consultationType are required');
  }

  const designer = await Designer.findById(designerId);
  if (!designer) {
    throw new ApiError(404, 'Designer not found');
  }

  // Check if slot is already booked for this designer on this date
  const targetDate = new Date(date);
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const existingBooking = await Consultation.findOne({
    designer: designerId,
    date: { $gte: startOfDay, $lte: endOfDay },
    time,
    status: 'Scheduled'
  });

  if (existingBooking) {
    throw new ApiError(400, 'This time slot is already booked for this designer on this date');
  }

  // Generate meeting link if Video Call
  let meetingLink = '';
  if (consultationType === 'Video Call') {
    const meetingRoomName = `SNS-NEST-${designer.name.replace(/\s+/g, '-')}-${Date.now()}`;
    meetingLink = `https://meet.jit.si/${meetingRoomName}`;
  }

  const consultation = new Consultation({
    user: userId,
    designer: designerId,
    date: targetDate,
    time,
    consultationType,
    meetingLink,
    notes: notes || ''
  });

  await consultation.save();

  // Create an in-app notification
  const notification = new Notification({
    recipient: userId,
    type: 'consultation',
    title: 'Consultation Scheduled',
    message: `Your ${consultationType} with ${designer.name} is confirmed for ${new Date(date).toLocaleDateString()} at ${time}.`,
    isRead: false
  });
  await notification.save();

  return res
    .status(201)
    .json(new ApiResponse(201, consultation, 'Consultation booked successfully'));
});

export const getUpcomingConsultations = catchAsync(async (req, res) => {
  const userId = req.user._id;

  // Find all scheduled consultations
  const upcoming = await Consultation.find({
    user: userId,
    status: 'Scheduled'
  })
    .populate('designer', 'name specialization experience rating profileImage')
    .sort({ date: 1, time: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, upcoming, 'Upcoming consultations fetched successfully'));
});

export const getConsultationHistory = catchAsync(async (req, res) => {
  const userId = req.user._id;

  // Find completed or cancelled consultations, or past consultations
  const history = await Consultation.find({
    user: userId,
    status: { $in: ['Completed', 'Cancelled'] }
  })
    .populate('designer', 'name specialization experience rating profileImage')
    .sort({ date: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, history, 'Consultation history fetched successfully'));
});

export const rescheduleConsultation = catchAsync(async (req, res) => {
  const { consultationId, date, time } = req.body;
  const userId = req.user._id;

  if (!consultationId || !date || !time) {
    throw new ApiError(400, 'consultationId, date, and time are required');
  }

  const consultation = await Consultation.findOne({ _id: consultationId, user: userId });
  if (!consultation) {
    throw new ApiError(404, 'Consultation booking not found');
  }

  const designer = await Designer.findById(consultation.designer);
  if (!designer) {
    throw new ApiError(404, 'Designer not found');
  }

  // Check slot availability for new date & time
  const targetDate = new Date(date);
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const existingBooking = await Consultation.findOne({
    _id: { $ne: consultationId },
    designer: consultation.designer,
    date: { $gte: startOfDay, $lte: endOfDay },
    time,
    status: 'Scheduled'
  });

  if (existingBooking) {
    throw new ApiError(400, 'This time slot is already booked for this designer on this date');
  }

  consultation.date = targetDate;
  consultation.time = time;
  await consultation.save();

  // Create an in-app notification
  const notification = new Notification({
    recipient: userId,
    type: 'consultation',
    title: 'Consultation Rescheduled',
    message: `Your meeting with ${designer.name} has been rescheduled to ${new Date(date).toLocaleDateString()} at ${time}.`,
    isRead: false
  });
  await notification.save();

  return res
    .status(200)
    .json(new ApiResponse(200, consultation, 'Consultation rescheduled successfully'));
});
