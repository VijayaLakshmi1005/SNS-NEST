import { Router } from 'express';
import {
  getDesigns,
  getDesignById,
  saveDesignToWishlist,
  removeDesignFromWishlist,
} from '../controllers/design.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getDesigns);
router.get('/:id', getDesignById);

// Protected routes to save/remove designs
router.post('/save', verifyJWT, saveDesignToWishlist);
router.delete('/save/:id', verifyJWT, removeDesignFromWishlist);

export default router;
