import express from 'express';
import { verifyJWT, restrictTo } from '../../middleware/auth.middleware.js';
import {
  getCmsPage,
  updateCmsPage,
  getBlogs,
  createBlog,
  updateBlog
} from './cms.controller.js';

const router = express.Router();

// Public Routes (Frontend rendering)
router.get('/pages/:page', getCmsPage);
router.get('/blogs', getBlogs);

// Protected Admin Routes
router.use(verifyJWT);
router.use(restrictTo('admin', 'super_admin'));

router.patch('/pages/:page', updateCmsPage);
router.post('/blogs', createBlog);
router.patch('/blogs/:id', updateBlog);

export default router;
