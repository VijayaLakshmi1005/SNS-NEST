import express from 'express';
import { verifyJWT, restrictTo } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';
import {
  getDesigners,
  getAppointments,
  bookAppointment,
  updateAppointmentStatus
} from './appointment.controller.js';

const router = express.Router();

// All appointment routes require authentication
router.use(verifyJWT);

// Get available designers
router.get('/designers', getDesigners);

// Client & Admin/Designer viewing appointments
router.get('/', getAppointments);

// Client booking
router.post('/', restrictTo(ROLES.CLIENT), bookAppointment);

// Admin & Designer updating statuses (Approve, Reschedule, Complete)
router.patch('/:id/status', restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DESIGNER), updateAppointmentStatus);

export default router;
