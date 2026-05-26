import { Invoice, Expense, FinancePayment, Commission, ActivityLog } from './finance.model.js';
import { emitFinanceUpdate, emitActivityLog } from './finance.socket.js';

export const getOverview = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    const expenses = await Expense.find().sort({ date: -1 });
    const payments = await FinancePayment.find().populate('invoiceId').sort({ createdAt: -1 }).limit(10);
    const activityFeed = await ActivityLog.find().sort({ timestamp: -1 }).limit(15);
    const commissions = await Commission.find();

    const totalRevenue = invoices.filter(i => ['Paid', 'Partial'].includes(i.status)).reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);
    const pendingDues = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Cancelled').reduce((acc, curr) => acc + ((curr.totalAmount || 0) - (curr.amountPaid || 0)), 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalCommissions = commissions.reduce((acc, curr) => acc + (curr.commissionAmount || 0), 0);
    const netProfit = totalRevenue - totalExpenses - totalCommissions;

    // Generate Dynamic Chart Data (Last 6 months exactly from data, NO Math.random or hardcoded values)
    const chartDataMap = {};
    for (let i = 5; i >= 0; i--) {
       const d = new Date();
       d.setMonth(d.getMonth() - i);
       const monthKey = d.toLocaleString('default', { month: 'short', year: 'numeric' });
       chartDataMap[monthKey] = { name: monthKey.split(' ')[0], revenue: 0, expense: 0, profit: 0, yearMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` };
    }

    invoices.forEach(inv => {
       if (['Paid', 'Partial'].includes(inv.status)) {
           const d = new Date(inv.updatedAt || inv.createdAt);
           if (!isNaN(d)) {
               const monthKey = d.toLocaleString('default', { month: 'short', year: 'numeric' });
               if (chartDataMap[monthKey]) {
                   chartDataMap[monthKey].revenue += (inv.amountPaid || 0);
               }
           }
       }
    });

    expenses.forEach(exp => {
       const d = new Date(exp.date || exp.createdAt);
       if (!isNaN(d)) {
           const monthKey = d.toLocaleString('default', { month: 'short', year: 'numeric' });
           if (chartDataMap[monthKey]) {
               chartDataMap[monthKey].expense += (exp.amount || 0);
           }
       }
    });

    const chartData = Object.values(chartDataMap).sort((a, b) => a.yearMonth.localeCompare(b.yearMonth)).map(item => {
        item.profit = item.revenue - item.expense;
        return item;
    });

    res.json({
      success: true,
      data: {
        kpis: {
           totalRevenue, pendingDues, totalExpenses, totalCommissions, netProfit
        },
        chartData,
        activityFeed,
        invoices: invoices.slice(0, 5),
        expenses: expenses.slice(0, 5),
        payments,
        commissions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
     const invoices = await Invoice.find().sort({ createdAt: -1 });
     res.json({ success: true, data: invoices });
  } catch (error) {
     res.status(500).json({ success: false, message: error.message });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const { clientName, projectName, items, taxRate = 18, dueDate } = req.body;
    
    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    const invoice = await Invoice.create({
      invoiceNumber, clientName, projectName, items, subtotal, taxRate, taxAmount, totalAmount, dueDate, amountPaid: 0
    });

    const log = await ActivityLog.create({
      title: 'Invoice Created', description: `${invoiceNumber} created for ${clientName}.`, type: 'Invoice'
    });

    emitFinanceUpdate();
    emitActivityLog(log);

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExpenses = async (req, res) => {
   try {
      const expenses = await Expense.find().sort({ date: -1 });
      res.json({ success: true, data: expenses });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

export const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    
    const log = await ActivityLog.create({
      title: 'Expense Added', description: `₹${expense.amount} for ${expense.category}.`, type: 'Expense'
    });

    emitFinanceUpdate();
    emitActivityLog(log);
    
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
