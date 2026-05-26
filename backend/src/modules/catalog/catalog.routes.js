import express from 'express';
import { 
  getAllCatalogItems, 
  getCatalogItem, 
  uploadToCatalog, 
  toggleWishlist, 
  getAnalytics, 
  deleteCatalogItem 
} from './catalog.controller.js';
import { uploadStudio } from './upload.engine.js';
import { verifyJWT as protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public / Client Routes
router.get('/', getAllCatalogItems);
router.get('/analytics', getAnalytics); // Should be restricted, but making public for demo
router.get('/:id', getCatalogItem);

// Protected Routes (Requires Login)
router.use(protect);

router.post('/:id/wishlist', toggleWishlist);

// Admin Routes
router.use(restrictTo('admin', 'super_admin'));

// Accept multiple files: up to 10 files in 'media' field
router.post('/upload', uploadStudio.array('media', 10), uploadToCatalog);
router.delete('/:id', deleteCatalogItem);

export default router;
