import mongoose from 'mongoose';

// Invoice Schema
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
  taxRate: { type: Number, default: 18 }, // GST 18%
  taxAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'], default: 'Draft' },
  dueDate: { type: Date },
}, { timestamps: true });

// Expense Schema
const expenseSchema = new mongoose.Schema({
  category: { type: String, enum: ['Procurement', 'Salary', 'Marketing', 'Logistics', 'Software', 'Other'], required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  vendorName: { type: String }, // optional, links to procurement
  status: { type: String, enum: ['Pending', 'Approved', 'Paid'], default: 'Approved' }
}, { timestamps: true });

// Safely export models to prevent Nodemon overwrite crashes
export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
export const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
