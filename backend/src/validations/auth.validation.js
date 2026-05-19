import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string({ required_error: 'Full name is required' }).min(2, 'Name is too short'),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    mobile: z.string({ required_error: 'Mobile number is required' }).min(10, 'Invalid mobile number'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
    role: z.enum(['client', 'designer', 'admin']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

export const otpVerifySchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    code: z.string({ required_error: 'OTP code is required' }).length(6, 'OTP must be 6 digits'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    code: z.string({ required_error: 'Verification code is required' }).length(6),
    newPassword: z.string({ required_error: 'New password is required' }).min(6),
  }),
});
