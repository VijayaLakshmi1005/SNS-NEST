import express from 'express';
import { getVendors, createProcurement, getProcurements, updateProcurementStatus } from './vendor.controller.js';
import { verifyJWT, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Require admin access for vendor operations
router.use(verifyJWT);
router.use(restrictTo('admin', 'super_admin', 'designer'));

router.get('/', getVendors);
router.get('/procurements', getProcurements);
router.post('/procurements', createProcurement);
router.patch('/procurements/:id/status', updateProcurementStatus);

export default router;
