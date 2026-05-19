import { Router } from 'express';
import { createOrder, verifyPayment, getPaymentHistory, getPaymentStatus } from '../controllers/payment.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createOrderSchema, verifyPaymentSchema } from '../validations/payment.validation.js';

const router = Router();

router.use(verifyJWT);

router.post('/create-order', validate(createOrderSchema), createOrder);
router.post('/verify', validate(verifyPaymentSchema), verifyPayment);
router.get('/history', getPaymentHistory);
router.get('/status', getPaymentStatus);

export default router;
