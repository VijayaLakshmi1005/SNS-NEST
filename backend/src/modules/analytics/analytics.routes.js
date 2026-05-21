import express from 'express';
import { getOverviewAnalytics } from './analytics.controller.js';
import { verifyJWT, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyJWT);
router.use(restrictTo('admin', 'super_admin'));

router.get('/overview', getOverviewAnalytics);

export default router;
