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

import { uploadStudio } from '../catalog/upload.engine.js';

router.patch('/pages/:page', updateCmsPage);
router.post('/blogs', createBlog);
router.patch('/blogs/:id', updateBlog);

// Generic CMS Media Upload
router.post('/upload', uploadStudio.single('media'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const url = `${process.env.VITE_API_URL ? process.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/uploads/${req.file.filename}`;
  res.status(200).json({ success: true, url });
});

export default router;
