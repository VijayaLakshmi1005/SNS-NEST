import { Booking } from '../models/Booking.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const bookConsultation = catchAsync(async (req, res) => {
  const { designerId, dateTime, type, roomType, notes } = req.body;
  const clientId = req.user._id;

  const designer = await User.findOne({ _id: designerId, role: 'designer' });
  if (!designer) {
    throw new ApiError(404, 'Premium Designer not found');
  }

  // Conflict boundaries check: Overlapping slot within 1 hour range
  const parsedDateTime = new Date(dateTime);
  const startRange = new Date(parsedDateTime.getTime() - 60 * 60 * 1000);
  const endRange = new Date(parsedDateTime.getTime() + 60 * 60 * 1000);

  const conflictingBooking = await Booking.findOne({
    designer: designerId,
    dateTime: { $gte: startRange, $lte: endRange },
    status: 'Scheduled'
  });

  if (conflictingBooking) {
    throw new ApiError(409, 'Conflict detected: Designer is already booked at this slot time');
  }

  const booking = new Booking({
    client: clientId,
    designer: designerId,
    dateTime: parsedDateTime,
    type,
    roomType,
    notes
  });

  await booking.save();

  return res
    .status(201)
    .json(new ApiResponse(201, booking, 'Consultation booked successfully'));
});

export const getBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.find({ client: req.user._id }).populate('designer', 'fullName email mobile profileImage');
  return res.status(200).json(new ApiResponse(200, bookings, 'Bookings retrieved successfully'));
});

export const getBookingById = catchAsync(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, client: req.user._id }).populate('designer', 'fullName email mobile profileImage');
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }
  return res.status(200).json(new ApiResponse(200, booking, 'Booking details fetched successfully'));
});

export const updateBooking = catchAsync(async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findOneAndUpdate(
    { _id: req.params.id, client: req.user._id },
    { status },
    { new: true, runValidators: true }
  );

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  return res.status(200).json(new ApiResponse(200, booking, 'Booking updated successfully'));
});

export const cancelBooking = catchAsync(async (req, res) => {
  const booking = await Booking.findOneAndUpdate(
    { _id: req.params.id, client: req.user._id },
    { status: 'Cancelled' },
    { new: true }
  );

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  return res.status(200).json(new ApiResponse(200, booking, 'Booking cancelled successfully'));
});
