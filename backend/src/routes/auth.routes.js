import { Router } from 'express';
import {
  registerUser,
  loginUser,
  verifyOTP,
  refreshSessionToken,
  logoutUser,
  getMe,
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  registerSchema,
  loginSchema,
  otpVerifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validations/auth.validation.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);
router.post('/verify-otp', authLimiter, validate(otpVerifySchema), verifyOTP);
router.post('/refresh-token', refreshSessionToken);
router.post('/logout', verifyJWT, logoutUser);
router.get('/me', verifyJWT, getMe);

export default router;
