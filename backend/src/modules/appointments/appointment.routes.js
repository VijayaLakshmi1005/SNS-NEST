import express from 'express';
import { verifyJWT, restrictTo } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';
import {
  getDesigners,
  getAppointments,
  bookAppointment,
  updateAppointmentStatus,
  rescheduleAppointment,
  getAnalytics,
  getUpcoming,
  getAvailability
} from './appointment.controller.js';

const router = express.Router();

// All appointment routes require authentication
router.use(verifyJWT);

// Get available designers
router.get('/designers', getDesigners);

// Analytics (Admin only)
router.get('/analytics', restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN), getAnalytics);

// Upcoming & Availability
router.get('/upcoming', getUpcoming);
router.get('/availability', getAvailability);

// Client & Admin/Designer viewing appointments
router.get('/', getAppointments);

// Client booking
router.post('/', restrictTo(ROLES.CLIENT), bookAppointment);

// Admin & Designer updating statuses (Approve, Complete)
router.patch('/:id/status', restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DESIGNER), updateAppointmentStatus);

// Admin & Designer rescheduling
router.patch('/:id/reschedule', restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DESIGNER), rescheduleAppointment);

export default router;
