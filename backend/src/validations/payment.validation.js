import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    amount: z.number({ required_error: 'Amount is required' }).positive(),
    milestoneName: z.string({ required_error: 'Milestone name is required' }),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpay_order_id: z.string({ required_error: 'Order ID is required' }),
    razorpay_payment_id: z.string({ required_error: 'Payment ID is required' }),
    razorpay_signature: z.string({ required_error: 'Signature is required' }),
  }),
});
