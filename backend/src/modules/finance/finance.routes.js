import express from 'express';
import { getOverview, getInvoices, createInvoice, getExpenses, createExpense } from './finance.controller.js';
import { createOrder, verifyPayment, webhookHandler } from './razorpay.controller.js';
import { verifyJWT, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public Webhook (Razorpay verifies signature itself)
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);

router.use(verifyJWT);
router.use(restrictTo('admin', 'super_admin'));

router.get('/overview', getOverview);

router.get('/invoices', getInvoices);
router.post('/invoices', createInvoice);

router.get('/expenses', getExpenses);
router.post('/expenses', createExpense);

// Razorpay APIs
router.post('/payments/create-order', createOrder);
router.post('/payments/verify', verifyPayment);

export default router;
