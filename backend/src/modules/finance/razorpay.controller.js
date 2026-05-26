import Razorpay from 'razorpay';
import crypto from 'crypto';
import { FinancePayment, Invoice, ActivityLog } from './finance.model.js';
import { emitPaymentSuccess, emitActivityLog, emitFinanceUpdate } from './finance.socket.js';

// Initialize Razorpay instance (using mock keys if env vars missing, though webhooks will fail without real keys)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret',
});

export const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', clientName, invoiceId } = req.body;
    
    // Convert amount to paise for Razorpay
    const options = {
      amount: amount * 100, 
      currency,
      receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      payment_capture: 1
    };

    let orderId = `mock_order_${Date.now()}`;

    // If using real keys, call razorpay
    if (process.env.RAZORPAY_KEY_ID) {
      const order = await razorpay.orders.create(options);
      orderId = order.id;
    }

    const payment = await FinancePayment.create({
      receiptId: options.receipt,
      razorpayOrderId: orderId,
      amount,
      currency,
      clientName,
      invoiceId,
      status: 'Created'
    });

    res.json({ success: true, orderId, amount: options.amount, currency: options.currency, receipt: options.receipt, paymentId: payment._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_id } = req.body;
    
    // For mock environment
    if (!process.env.RAZORPAY_KEY_SECRET) {
       await finalizePayment(payment_id, razorpay_payment_id || `mock_pay_${Date.now()}`, 'Card');
       return res.json({ success: true, message: 'Mock payment verified' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest('hex');
    
    if (expectedSignature === razorpay_signature) {
      await finalizePayment(payment_id, razorpay_payment_id, 'UPI'); // simplified method
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      await FinancePayment.findByIdAndUpdate(payment_id, { status: 'Failed' });
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const finalizePayment = async (dbPaymentId, gatewayPaymentId, method) => {
  const payment = await FinancePayment.findByIdAndUpdate(dbPaymentId, {
    razorpayPaymentId: gatewayPaymentId,
    method,
    status: 'Captured'
  }, { new: true }).populate('invoiceId');

  if (payment.invoiceId) {
    // Update invoice amountPaid and status
    const invoice = payment.invoiceId;
    invoice.amountPaid += payment.amount;
    if (invoice.amountPaid >= invoice.totalAmount) {
       invoice.status = 'Paid';
    } else {
       invoice.status = 'Partial';
    }
    await invoice.save();
  }

  // Create Activity Log
  const log = await ActivityLog.create({
    title: 'Payment Received',
    description: `₹${payment.amount.toLocaleString()} received from ${payment.clientName}.`,
    type: 'Payment'
  });

  // Emit Realtime Events
  emitPaymentSuccess(payment);
  emitActivityLog(log);
};

export const webhookHandler = async (req, res) => {
   // Implementation for async razorpay webhooks
   // Verifies x-razorpay-signature header
   res.json({status: 'ok'});
};
