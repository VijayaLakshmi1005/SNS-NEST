import express from 'express';
import { verifyJWT, restrictTo } from '../../middleware/auth.middleware.js';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLeadStatus,
  assignLead,
  addFollowUp
} from './lead.controller.js';

const router = express.Router();

// Public route for lead capture (e.g., from website forms)
router.post('/capture', createLead);

// Protected CRM routes
router.use(verifyJWT);

router.post('/', restrictTo('admin'), createLead);
router.get('/', restrictTo('admin', 'designer'), getLeads);
router.get('/:id', restrictTo('admin', 'designer'), getLeadById);

// Kanban drag and drop update
router.patch('/:id/status', restrictTo('admin', 'designer'), updateLeadStatus);

router.post('/:id/assign', restrictTo('admin'), assignLead);
router.post('/:id/followup', restrictTo('admin', 'designer'), addFollowUp);

export default router;
