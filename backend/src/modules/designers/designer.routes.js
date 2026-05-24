import express from 'express';
// import { verifyJWT } from '../../middleware/auth.middleware.js';
import * as designerController from './designer.controller.js';

const router = express.Router();

router.get('/', designerController.getDesigners);
router.post('/create', designerController.createDesigner);
router.get('/analytics', designerController.getAnalytics);
router.patch('/:id/status', designerController.updateStatus);

router.get('/:id', designerController.getDesignerById);
router.patch('/:id', designerController.updateDesigner);
router.delete('/:id', designerController.deleteDesigner);
router.post('/:id/assign-project', designerController.assignProject);
router.post('/:id/message', designerController.sendMessage);
router.post('/:id/upload-profile', designerController.uploadProfile);
router.post('/:id/upload-portfolio', designerController.uploadPortfolio);

router.get('/workload/overview', designerController.getWorkload);
router.get('/schedules/overview', designerController.getSchedules);

export default router;
