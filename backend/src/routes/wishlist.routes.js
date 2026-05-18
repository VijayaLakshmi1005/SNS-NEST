import { Router } from 'express';
import { getWishlist } from '../controllers/wishlist.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.get('/', getWishlist);

export default router;
