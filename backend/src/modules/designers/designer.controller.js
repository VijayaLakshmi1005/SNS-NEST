import { Designer } from './designer.model.js';
import { Consultation } from '../consultations/consultation.model.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { catchAsync } from '../../utils/catchAsync.js';

export const getDesigners = catchAsync(async (req, res) => {
  const designers = await Designer.find({});
  return res.status(200).json(new ApiResponse(200, designers, 'Designers fetched successfully'));
});

export const getDesignerById = catchAsync(async (req, res) => {
  const designer = await Designer.findById(req.params.id);
  if (!designer) {
    throw new ApiError(404, 'Designer not found');
  }
  return res.status(200).json(new ApiResponse(200, designer, 'Designer fetched successfully'));
});

export const getDesignerAvailability = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { date } = req.query; // YYYY-MM-DD format

  if (!date) {
    throw new ApiError(400, 'Date query parameter is required (format: YYYY-MM-DD)');
  }

  const designer = await Designer.findById(id);
  if (!designer) {
    throw new ApiError(404, 'Designer not found');
  }

  // Get day of the week from the date
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new ApiError(400, 'Invalid date format');
  }

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = daysOfWeek[parsedDate.getUTCDay()];

  // Find designer availability for that day
  const dayAvailability = designer.availability.find(av => av.day === dayName);
  const totalSlots = dayAvailability ? dayAvailability.slots : [];

  // Query existing booked consultations for this designer on this date
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const bookings = await Consultation.find({
    designer: id,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: 'Scheduled'
  });

  const bookedSlots = bookings.map(b => b.time);

  // Filter out booked slots
  const availableSlots = totalSlots.map(slot => ({
    time: slot,
    available: !bookedSlots.includes(slot)
  }));

  return res.status(200).json(
    new ApiResponse(
      200, 
      {
        date,
        dayName,
        slots: availableSlots
      }, 
      'Designer availability slots calculated successfully'
    )
  );
});
