import express from 'express';
import { restrictTo } from '../../middleware/auth.middleware.js';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import * as dashboardController from './dashboard.controller.js';

const router = express.Router();

// All dashboard routes are protected and restricted to admin/super_admin
router.use(verifyJWT, restrictTo('admin', 'super_admin'));

router.get('/overview', dashboardController.getOverview);
router.get('/revenue', dashboardController.getRevenue);
router.get('/leads', dashboardController.getLeads);
router.get('/projects', dashboardController.getProjects);
router.get('/designers', dashboardController.getDesigners);
router.get('/payments', dashboardController.getPayments);
router.get('/activities', dashboardController.getActivities);

export default router;
