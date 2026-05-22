import { Invoice, Expense } from './finance.model.js';
import { getIO } from '../../config/socket.js';

// Auto-seed initial financial data for realism without crashing
const seedFinanceData = async () => {
  try {
    const invCount = await Invoice.countDocuments();
    if (invCount === 0) {
      await Invoice.create([
        {
          invoiceNumber: 'INV-2026-001',
          clientName: 'Arjun Kapoor',
          projectName: 'Sea Facing Penthouse',
          items: [{ description: 'Design Consultation & 3D Renders', quantity: 1, rate: 150000, amount: 150000 }],
          subtotal: 150000,
          taxRate: 18,
          taxAmount: 27000,
          totalAmount: 177000,
          status: 'Paid',
          dueDate: new Date()
        },
        {
          invoiceNumber: 'INV-2026-002',
          clientName: 'Neha Sharma',
          projectName: 'Modern Minimalist Villa',
          items: [{ description: 'Living Room Furniture Package', quantity: 1, rate: 450000, amount: 450000 }],
          subtotal: 450000,
          taxRate: 18,
          taxAmount: 81000,
          totalAmount: 531000,
          status: 'Sent',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      ]);
      await Expense.create([
        { category: 'Procurement', description: 'Italian Marble Slabs', amount: 200000, vendorName: 'Luxe Marble & Granite', status: 'Paid' },
        { category: 'Software', description: 'SaaS Platform Hosting', amount: 15000, status: 'Paid' }
      ]);
      console.log('Seeded luxury finance data.');
    }
  } catch (err) {
    console.error('Error seeding finance data:', err);
  }
};
seedFinanceData();

export const getOverview = async (req, res) => {
  try {
    const invoices = await Invoice.find();
    const expenses = await Expense.find();

    const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.totalAmount, 0);
    const pendingDues = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Cancelled').reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    res.json({
      success: true,
      data: {
        totalRevenue,
        pendingDues,
        totalExpenses,
        netProfit,
        invoices,
        expenses
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const { clientName, projectName, items, taxRate = 18, dueDate } = req.body;
    
    // Auto generate invoice number
    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    const invoice = await Invoice.create({
      invoiceNumber,
      clientName,
      projectName,
      items,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      dueDate
    });

    try { getIO().emit('financeUpdated'); } catch(e) {}

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    try { getIO().emit('financeUpdated'); } catch(e) {}
    
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    
    try { getIO().emit('financeUpdated'); } catch(e) {}
    
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
