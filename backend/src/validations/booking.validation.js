import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    designerId: z.string({ required_error: 'Designer ID is required' }),
    dateTime: z.string({ required_error: 'Date and time is required' }).datetime('Invalid datetime format'),
    type: z.enum(['Video', 'Offline'], { required_error: 'Consultation type is required' }),
    roomType: z.string({ required_error: 'Room type is required' }),
    notes: z.string().optional(),
  }),
});

export const updateBookingSchema = z.object({
  body: z.object({
    status: z.enum(['Scheduled', 'Completed', 'Cancelled']),
  }).partial(),
});
