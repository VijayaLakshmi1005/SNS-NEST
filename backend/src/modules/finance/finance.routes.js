import express from 'express';
import { getFinanceOverview } from './analytics.service.js';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice, getInvoiceById } from './invoice.controller.js';
import { getExpenses, createExpense, updateExpense, deleteExpense } from './procurement.controller.js';
import { createOrder, verifyPayment, webhookHandler, getPayments, createManualPayment } from './payments.controller.js';
import { verifyJWT, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Webhooks
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);

router.use(verifyJWT);
router.use(restrictTo('admin', 'super_admin'));

// Dashboard Overview & Analytics
router.get('/overview', getFinanceOverview);

// Invoices CRUD
router.get('/invoices', getInvoices);
router.post('/invoices', createInvoice);
router.get('/invoices/:id', getInvoiceById);
router.patch('/invoices/:id', updateInvoice);
router.delete('/invoices/:id', deleteInvoice);

import { upload } from '../../middleware/upload.middleware.js';

// Procurement (Expenses) CRUD
router.get('/procurement', getExpenses);
router.post('/procurement', upload.single('receipt'), createExpense);
router.patch('/procurement/:id', upload.single('receipt'), updateExpense);
router.delete('/procurement/:id', deleteExpense);

// Payments (Razorpay + Manual)
router.get('/payments', getPayments);
router.post('/payments/manual', createManualPayment);
router.post('/payments/create-order', createOrder);
router.post('/payments/verify', verifyPayment);

export default router;
