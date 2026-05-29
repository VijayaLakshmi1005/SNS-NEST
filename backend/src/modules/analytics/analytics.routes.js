import express from 'express';
import { 
  getDashboardKPIs,
  getRevenueAnalytics,
  getLeadAnalytics,
  getProjectAnalytics,
  getDesignerLeaderboard,
  getActivityFeed
} from './analytics.controller.js';
import { verifyJWT, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyJWT);
router.use(restrictTo('admin', 'super_admin'));

router.get('/dashboard', getDashboardKPIs);
router.get('/revenue', getRevenueAnalytics);
router.get('/leads', getLeadAnalytics);
router.get('/projects', getProjectAnalytics);
router.get('/designers', getDesignerLeaderboard);
router.get('/activity', getActivityFeed);

export default router;
