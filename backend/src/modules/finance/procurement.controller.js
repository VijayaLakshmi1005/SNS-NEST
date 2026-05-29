import { Expense, ActivityLog } from './finance.model.js';
import { emitFinanceUpdate, emitActivityLog } from './finance.socket.js';

import { uploadToCloudinary } from '../../services/cloudinary.service.js';

export const getExpenses = async (req, res) => {
   try {
      const expenses = await Expense.find().populate('vendorId projectId').sort({ date: -1 });
      res.json({ success: true, data: expenses });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

export const createExpense = async (req, res) => {
  try {
    const { category, description, amount, date, vendorId, projectId, status } = req.body;
    
    let receiptUrl = '';
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'finance-receipts');
      if (uploadResult && uploadResult.secure_url) {
        receiptUrl = uploadResult.secure_url;
      }
    }
    
    const expense = await Expense.create({
      category, description, amount, date, vendorId, projectId, status: status || 'Approved', receiptUrl
    });
    
    const log = await ActivityLog.create({
      title: 'Procurement Added', description: `₹${amount.toLocaleString()} logged for ${category}.`, type: 'Expense'
    });

    emitFinanceUpdate();
    emitActivityLog(log);
    
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'finance-receipts');
      if (uploadResult && uploadResult.secure_url) {
        updateData.receiptUrl = uploadResult.secure_url;
      }
    }

    const expense = await Expense.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('vendorId projectId');
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

    const log = await ActivityLog.create({
      title: 'Procurement Updated', description: `Expense record updated.`, type: 'Expense'
    });

    emitFinanceUpdate();
    emitActivityLog(log);

    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

    const log = await ActivityLog.create({
      title: 'Procurement Deleted', description: `Expense record deleted.`, type: 'Expense'
    });

    emitFinanceUpdate();
    emitActivityLog(log);

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
