import express from 'express';
import { getOverview, createInvoice, updateInvoiceStatus, createExpense } from './finance.controller.js';
import { verifyJWT, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyJWT);
router.use(restrictTo('admin', 'super_admin'));

router.get('/overview', getOverview);
router.post('/invoices', createInvoice);
router.patch('/invoices/:id/status', updateInvoiceStatus);
router.post('/expenses', createExpense);

export default router;
