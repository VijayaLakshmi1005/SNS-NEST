import { createRazorpayOrder, verifyRazorpaySignature } from '../services/payment.service.js';
import { Payment } from '../models/Payment.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createOrder = catchAsync(async (req, res) => {
  const { amount, milestoneName } = req.body;

  const order = await createRazorpayOrder(amount);

  const payment = new Payment({
    client: req.user._id,
    orderId: order.id,
    amount,
    milestoneName
  });

  await payment.save();

  return res
    .status(201)
    .json(new ApiResponse(201, order, 'Razorpay order created successfully'));
});

export const verifyPayment = catchAsync(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const payment = await Payment.findOne({ orderId: razorpay_order_id });
  if (!payment) {
    throw new ApiError(404, 'Payment record with order ID not found');
  }

  const isSignatureValid = verifyRazorpaySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isSignatureValid) {
    payment.status = 'Failed';
    await payment.save();
    throw new ApiError(400, 'Security Verification Failed: Invalid payment checksum signature');
  }

  payment.paymentId = razorpay_payment_id;
  payment.signature = razorpay_signature;
  payment.status = 'Paid';
  await payment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, payment, 'Payment verified and transaction completed successfully'));
});

export const getPaymentHistory = catchAsync(async (req, res) => {
  const history = await Payment.find({ client: req.user._id }).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, history, 'Payment history retrieved successfully'));
});

export const getPaymentStatus = catchAsync(async (req, res) => {
  const userId = req.user._id;
  
  // Get active project budget
  const { Project } = await import('../models/Project.js');
  const project = await Project.findOne({ client: userId }).sort({ createdAt: -1 });
  const totalAmount = project?.budget || 0;

  const payments = await Payment.find({ client: userId, status: 'Paid' });
  const paidAmount = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const pendingAmount = Math.max(0, totalAmount - paidAmount);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        paidAmount: paidAmount,
        totalAmount: totalAmount,
        pendingAmount: pendingAmount,
        invoiceCount: payments.length,
        nextDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      'Payment status retrieved successfully'
    )
  );
});
