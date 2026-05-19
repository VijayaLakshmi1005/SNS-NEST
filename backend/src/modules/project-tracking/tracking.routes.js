import { Router } from 'express';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { siteUpdateSchema, activitySchema } from './tracking.validation.js';
import * as trackingController from './tracking.controller.js';

const router = Router();

// Gated routes under authentication verification
router.use(verifyJWT);

// 1. Current tracking dashboard for logged-in user
router.get('/current', trackingController.getCurrentTracking);

// 2. Project tracking by specific ID
router.get('/:id', trackingController.getProjectTracking);

// 3. Milestones list
router.get('/:id/milestones', trackingController.getMilestones);

// 4. Activities log list
router.get('/:id/activities', trackingController.getActivities);

// 5. Site updates / photos
router.get('/:id/site-updates', trackingController.getSiteUpdates);

// 6. Procurements tracking list
router.get('/:id/procurement', trackingController.getProcurement);

// 7. Add site update photos
router.post('/:id/site-updates', validate(siteUpdateSchema), trackingController.addSiteUpdate);

// 8. Add activity feed update
router.post('/:id/activities', validate(activitySchema), trackingController.addActivity);

export default router;
