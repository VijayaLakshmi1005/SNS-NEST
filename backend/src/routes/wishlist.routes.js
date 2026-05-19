import { Router } from 'express';
import { getWishlist, getRecentWishlist } from '../controllers/wishlist.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.get('/', getWishlist);
router.get('/recent', getRecentWishlist);

export default router;
