import mongoose from 'mongoose';

// 1. Finance Vendor Schema (Lightweight for Procurement mapping)
const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  category: { type: String, required: true }, // e.g. Hardware, Lumber, Logistics
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

// 2. Invoice Schema
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  clientName: { type: String, required: true },
  projectName: { type: String },
  items: [{
    description: String,
    quantity: Number,
    rate: Number,
    amount: Number
  }],
  subtotal: { type: Number, required: true },
  taxRate: { type: Number, default: 18 },
  taxAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  status: { type: String, enum: ['Draft', 'Sent', 'Partial', 'Paid', 'Overdue', 'Cancelled'], default: 'Draft' },
  dueDate: { type: Date },
  notes: { type: String }
}, { timestamps: true });

// 3. Procurement (Expense) Schema
const expenseSchema = new mongoose.Schema({
  category: { type: String, enum: ['Procurement', 'Salary', 'Marketing', 'Logistics', 'Software', 'Commission', 'Other'], required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'FinanceVendor' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  receiptUrl: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Paid'], default: 'Approved' }
}, { timestamps: true });

// 4. Payment Schema (Razorpay & Manual integration)
const paymentSchema = new mongoose.Schema({
  receiptId: { type: String, required: true, unique: true },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  clientName: { type: String, required: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  method: { type: String, enum: ['UPI', 'Card', 'NetBanking', 'Wallet', 'BankTransfer', 'Cash', 'Pending'], default: 'Pending' },
  status: { type: String, enum: ['Created', 'Captured', 'Failed', 'Refunded'], default: 'Created' },
  notes: { type: String }
}, { timestamps: true });

// 5. Commission Schema (Designer Payouts)
const commissionSchema = new mongoose.Schema({
  designerName: { type: String, required: true },
  projectName: { type: String, required: true },
  totalRevenue: { type: Number, required: true },
  commissionRate: { type: Number, required: true },
  commissionAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  payoutDate: { type: Date }
}, { timestamps: true });

// 6. Activity Log Schema
const activityLogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['Payment', 'Invoice', 'Expense', 'System', 'Alert'], required: true },
  timestamp: { type: Date, default: Date.now }
});

export const FinanceVendor = mongoose.models.FinanceVendor || mongoose.model('FinanceVendor', vendorSchema);
export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
export const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
export const FinancePayment = mongoose.models.FinancePayment || mongoose.model('FinancePayment', paymentSchema);
export const Commission = mongoose.models.Commission || mongoose.model('Commission', commissionSchema);
export const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
