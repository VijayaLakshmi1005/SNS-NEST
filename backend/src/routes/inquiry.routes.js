import { Router } from 'express';
import {
  createInquiry,
  getClientInquiry,
  getAllInquiries,
  sendProposal,
  acceptProposal,
  deleteInquiry
} from '../controllers/inquiry.controller.js';
import { verifyJWT, restrictTo } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.use(verifyJWT);

// Client Routes
router.post('/', upload.single('floorPlan'), createInquiry);
router.get('/current', getClientInquiry);
router.post('/:id/accept', acceptProposal);

// Admin Routes
router.get('/', restrictTo('admin', 'super_admin'), getAllInquiries);
router.patch('/:id/proposal', restrictTo('admin', 'super_admin', 'designer'), upload.fields([{ name: 'model3D', maxCount: 1 }, { name: 'pdfQuotation', maxCount: 1 }]), sendProposal);
router.delete('/:id', restrictTo('admin', 'super_admin'), deleteInquiry);

export default router;
