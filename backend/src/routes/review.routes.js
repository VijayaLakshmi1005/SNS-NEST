import { Router } from 'express';
import { createReview, getReviews } from '../controllers/review.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getReviews);
router.post('/', verifyJWT, createReview);

export default router;
