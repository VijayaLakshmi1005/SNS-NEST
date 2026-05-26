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
  getActivityFeed,
  getProjectAnalytics,
  updateProjectProgress,
  getProjectTasks,
  createProjectTask,
  updateProjectTaskStatus,
  updateProjectTask,
  deleteProjectTask
} from './project.controller.js';

const router = express.Router();

router.use(verifyJWT);

// Analytics must come before /:id routes
router.get('/analytics', restrictTo('admin', 'designer'), getProjectAnalytics);

router.post('/', restrictTo('admin'), createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.patch('/:id/progress', updateProjectProgress);

router.get('/:id/tasks', getProjectTasks);
router.post('/:id/tasks', createProjectTask);
router.patch('/:id/tasks/:taskId/status', updateProjectTaskStatus);
router.patch('/:id/tasks/:taskId', updateProjectTask);
router.delete('/:id/tasks/:taskId', deleteProjectTask);

router.post('/:id/assign', restrictTo('admin'), assignUsers);

router.post('/:id/milestones', restrictTo('admin', 'designer'), addMilestone);
router.patch('/:id/milestones/:milestoneId', restrictTo('admin', 'designer'), updateMilestoneStatus);

router.post('/:id/upload', uploadDocument);
router.patch('/:id/upload/:uploadId/approve', approveDocument);

router.get('/:id/activity', getActivityFeed);

export default router;
