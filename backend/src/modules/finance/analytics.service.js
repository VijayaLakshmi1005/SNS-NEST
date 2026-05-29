import mongoose from 'mongoose';
import { Payment } from '../../models/Payment.js';
import { Invoice, Expense, FinancePayment, Commission, ActivityLog, FinanceVendor } from './finance.model.js';

export const getFinanceOverview = async (req, res) => {
  try {
    let invoices = await Invoice.find().sort({ createdAt: -1 });
    
    // Auto-update overdue statuses
    const now = new Date();
    let hasOverdueUpdates = false;
    for (let inv of invoices) {
        if (inv.status === 'Sent' && inv.dueDate && new Date(inv.dueDate) < now) {
            inv.status = 'Overdue';
            await inv.save();
            hasOverdueUpdates = true;
        }
    }
    if (hasOverdueUpdates) invoices = await Invoice.find().sort({ createdAt: -1 });
    
    const expenses = await Expense.find().populate('vendorId projectId').sort({ date: -1 });
    const payments = await FinancePayment.find().populate('invoiceId').sort({ createdAt: -1 }).limit(10);
    const activityFeed = await ActivityLog.find().sort({ timestamp: -1 }).limit(15);
    const commissions = await Commission.find();
    const vendors = await FinanceVendor.find();

    const paymentsData = await Payment.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = paymentsData.length > 0 ? paymentsData[0].total : 0;

    const pendingDues = invoices.filter(i => !['Paid', 'Cancelled', 'Draft'].includes(i.status)).reduce((acc, curr) => acc + ((curr.totalAmount || 0) - (curr.amountPaid || 0)), 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalCommissions = commissions.reduce((acc, curr) => acc + (curr.commissionAmount || 0), 0);
    const netProfit = totalRevenue - totalExpenses - totalCommissions;

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
        kpis: { totalRevenue, pendingDues, totalExpenses, totalCommissions, netProfit },
        chartData,
        activityFeed,
        invoices: invoices.slice(0, 15),
        expenses: expenses.slice(0, 15),
        payments,
        vendors
      }
    });
  } catch (error) {
    console.error('FINANCE OVERVIEW ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
