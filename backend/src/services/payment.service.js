import { razorpay } from '../config/razorpay.js';
import crypto from 'crypto';
import { ApiError } from '../utils/ApiError.js';

export const createRazorpayOrder = async (amount, currency = 'INR') => {
  const options = {
    amount: Math.round(amount * 100), // convert to paise
    currency,
    receipt: `receipt_order_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    throw new ApiError(500, `Razorpay Order Creation Failed: ${error.message}`);
  }
};

export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'dummykeysecret123456789';
  const hmac = crypto.createHmac('sha256', keySecret);
  hmac.update(`${orderId}|${paymentId}`);
  const generatedSignature = hmac.digest('hex');

  return generatedSignature === signature;
};
