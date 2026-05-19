import { Router } from 'express';
import { getEstimateCostBreakdown, getEstimateById } from '../controllers/estimate.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { calculateEstimateSchema } from '../validations/estimate.validation.js';

const router = Router();

router.use(verifyJWT);

router.post('/calculate', validate(calculateEstimateSchema), getEstimateCostBreakdown);
router.get('/:id', getEstimateById);

export default router;
