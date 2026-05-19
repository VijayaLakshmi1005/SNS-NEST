import { Router } from 'express';
import {
  bookConsultation,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
} from '../controllers/booking.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createBookingSchema, updateBookingSchema } from '../validations/booking.validation.js';

const router = Router();

router.use(verifyJWT);

router.post('/', validate(createBookingSchema), bookConsultation);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.patch('/:id', validate(updateBookingSchema), updateBooking);
router.delete('/:id', cancelBooking);

export default router;
