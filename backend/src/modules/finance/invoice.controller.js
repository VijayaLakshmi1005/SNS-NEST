import { Invoice, ActivityLog } from './finance.model.js';
import { emitFinanceUpdate, emitActivityLog } from './finance.socket.js';

export const getInvoices = async (req, res) => {
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

     res.json({ success: true, data: invoices });
  } catch (error) {
     res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
     const invoice = await Invoice.findById(req.params.id);
     if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
     res.json({ success: true, data: invoice });
  } catch (error) {
     res.status(500).json({ success: false, message: error.message });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const { clientName, projectName, items, taxRate = 18, discount = 0, dueDate, notes, status } = req.body;
    
    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount - discount;
    const amountPaid = status === 'Paid' ? totalAmount : 0;

    const invoice = await Invoice.create({
      invoiceNumber, clientName, projectName, items, subtotal, taxRate, taxAmount, discount, totalAmount, amountPaid, dueDate, notes, status: status || 'Draft'
    });

    const log = await ActivityLog.create({
      title: 'Invoice Created', description: `${invoiceNumber} created for ${clientName} (₹${totalAmount.toLocaleString()}).`, type: 'Invoice'
    });

    emitFinanceUpdate();
    emitActivityLog(log);

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const { clientName, projectName, items, taxRate = 18, discount = 0, dueDate, notes, status, amountPaid } = req.body;
    
    let updateData = { clientName, projectName, items, taxRate, discount, dueDate, notes, status };
    
    if (items) {
      const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
      const taxAmount = (subtotal * taxRate) / 100;
      updateData.subtotal = subtotal;
      updateData.taxAmount = taxAmount;
      updateData.totalAmount = subtotal + taxAmount - discount;
    }

    if (status === 'Paid') {
      updateData.amountPaid = updateData.totalAmount || (await Invoice.findById(req.params.id)).totalAmount;
    } else if (amountPaid !== undefined) {
      updateData.amountPaid = amountPaid;
    }

    const invoice = await Invoice.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const log = await ActivityLog.create({
      title: 'Invoice Updated', description: `${invoice.invoiceNumber} updated.`, type: 'Invoice'
    });

    emitFinanceUpdate();
    emitActivityLog(log);

    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const log = await ActivityLog.create({
      title: 'Invoice Deleted', description: `${invoice.invoiceNumber} deleted.`, type: 'Invoice'
    });

    emitFinanceUpdate();
    emitActivityLog(log);

    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
