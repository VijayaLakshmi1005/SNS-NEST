import { Router } from 'express';
import {
  getDashboardOverview,
  getDashboardProjects,
  getDashboardMeetings,
  getDashboardNotifications,
} from '../controllers/dashboard.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.get('/overview', getDashboardOverview);
router.get('/projects', getDashboardProjects);
router.get('/meetings', getDashboardMeetings);
router.get('/notifications', getDashboardNotifications);

export default router;
