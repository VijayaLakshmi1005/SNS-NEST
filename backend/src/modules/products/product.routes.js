import express from 'express';
import { verifyJWT, restrictTo } from '../../middleware/auth.middleware.js';
import {
  getProducts,
  getProductById,
  createProduct,
  updateInventory,
  getCategories,
  seedCategories
} from './product.controller.js';

const router = express.Router();

// Public routes (Clients can view products)
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Protected Admin Routes
router.use(verifyJWT);

router.post('/categories/seed', restrictTo('super_admin'), seedCategories);
router.post('/', restrictTo('admin', 'super_admin'), createProduct);
router.patch('/:id/inventory', restrictTo('admin', 'super_admin'), updateInventory);

export default router;
