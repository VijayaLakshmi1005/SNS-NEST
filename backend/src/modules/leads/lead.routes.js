import express from 'express';
import { verifyJWT, restrictTo } from '../../middleware/auth.middleware.js';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLeadStatus,
  assignLead,
  addFollowUp,
  addLeadNote,
  convertLead,
  deleteLead,
  scheduleConsultation,
  sendProposal,
  getLeadAnalytics
} from './lead.controller.js';

const router = express.Router();

// Public route for lead capture (e.g., from website forms)
router.post('/capture', createLead);

// Protected CRM routes
router.use(verifyJWT);

router.post('/', restrictTo('admin'), createLead);
router.get('/', restrictTo('admin', 'designer'), getLeads);
router.get('/:id', restrictTo('admin', 'designer'), getLeadById);

router.patch('/:id/status', restrictTo('admin', 'designer'), updateLeadStatus);

router.post('/:id/assign', restrictTo('admin'), assignLead);
router.post('/:id/followup', restrictTo('admin', 'designer'), addFollowUp);

router.post('/:id/notes', restrictTo('admin', 'designer'), addLeadNote);
router.post('/:id/convert', restrictTo('admin'), convertLead);
router.delete('/:id', restrictTo('admin'), deleteLead);
router.post('/:id/schedule-consultation', restrictTo('admin', 'designer'), scheduleConsultation);
router.post('/:id/send-proposal', restrictTo('admin', 'designer'), sendProposal);
router.get('/dashboard/analytics', restrictTo('admin', 'designer'), getLeadAnalytics); // Avoids conflict with /:id

export default router;
