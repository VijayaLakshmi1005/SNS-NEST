import express from 'express';
import { verifyJWT, restrictTo } from '../../middleware/auth.middleware.js';
import {
  createProject,
  getProjects,
  getProjectById,
  assignUsers,
  addMilestone,
  updateMilestoneStatus,
  uploadDocument,
  approveDocument,
  getActivityFeed
} from './project.controller.js';

const router = express.Router();

router.use(verifyJWT);

router.post('/', restrictTo('admin'), createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);

router.post('/:id/assign', restrictTo('admin'), assignUsers);

router.post('/:id/milestones', restrictTo('admin', 'designer'), addMilestone);
router.patch('/:id/milestones/:milestoneId', restrictTo('admin', 'designer'), updateMilestoneStatus);

router.post('/:id/upload', uploadDocument);
router.patch('/:id/upload/:uploadId/approve', approveDocument);

router.get('/:id/activity', getActivityFeed);

export default router;
