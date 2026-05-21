import express from 'express';
import { 
  getDesigners, 
  getDesignerById, 
  getDesignerAvailability,
  getDesignerAnalytics,
  assignProject,
  uploadDesign
} from './designer.controller.js';
import { verifyJWT, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/analytics', verifyJWT, restrictTo('admin'), getDesignerAnalytics);
router.get('/', getDesigners);
router.get('/:id', getDesignerById);
router.get('/:id/availability', getDesignerAvailability);

router.post('/:id/assign-project', verifyJWT, restrictTo('admin'), assignProject);
router.post('/:id/upload', verifyJWT, restrictTo('admin', 'designer'), uploadDesign);

export default router;
