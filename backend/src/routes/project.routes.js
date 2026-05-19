import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  updateProjectMilestoneStatus,
  uploadSitePhotos,
  getCurrentProject,
  getProjectMilestones,
} from '../controllers/project.controller.js';
import { verifyJWT, restrictTo } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.use(verifyJWT);

router.get('/', getProjects);
router.get('/current', getCurrentProject);
router.get('/:id', getProjectById);
router.get('/:id/milestones', getProjectMilestones);

// Admin or Designer specific routes for milestone updates & photos
router.patch('/:id/status', restrictTo('admin', 'designer'), updateProjectMilestoneStatus);
router.post('/:id/photos', restrictTo('admin', 'designer'), upload.single('photo'), uploadSitePhotos);

export default router;
