import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';

export default function InvoiceModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    clientName: '',
    projectName: '',
    taxRate: 18,
    discount: 0,
    dueDate: '',
    notes: '',
    status: 'Draft',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        clientName: initialData.clientName || '',
        projectName: initialData.projectName || '',
        taxRate: initialData.taxRate || 18,
        discount: initialData.discount || 0,
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
        notes: initialData.notes || '',
        status: initialData.status || 'Draft',
        items: initialData.items && initialData.items.length > 0 ? initialData.items : [{ description: '', quantity: 1, rate: 0, amount: 0 }]
      });
    } else if (isOpen) {
      setFormData({
        clientName: '', projectName: '', taxRate: 18, discount: 0, dueDate: '', notes: '', status: 'Draft',
        items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = Number(newItems[index].quantity) * Number(newItems[index].rate);
    }
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { description: '', quantity: 1, rate: 0, amount: 0 }] });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
    }
  };

  const subtotal = formData.items.reduce((acc, item) => acc + (item.amount || 0), 0);
  const tax = (subtotal * formData.taxRate) / 100;
  const total = subtotal + tax - formData.discount;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d2a26]/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-[#e5e0d8]"
          >
            <div className="flex justify-between items-center p-6 border-b border-[#e5e0d8] bg-[#fcfbf9]">
              <h2 className="text-2xl font-bold text-[#2d2a26] font-nav-style">
                {initialData ? 'Edit Invoice' : 'Create New Invoice'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#8b8175]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#8b8175] uppercase tracking-wider mb-2">Client Name</label>
                  <input type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full p-3 bg-[#f5f4f0] border border-[#e5e0d8] rounded-xl focus:ring-2 focus:ring-[#2d2a26] focus:outline-none transition-all" placeholder="Enter client name" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#8b8175] uppercase tracking-wider mb-2">Project Name</label>
                  <input type="text" value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} className="w-full p-3 bg-[#f5f4f0] border border-[#e5e0d8] rounded-xl focus:ring-2 focus:ring-[#2d2a26] focus:outline-none transition-all" placeholder="Enter project name" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#8b8175] uppercase tracking-wider mb-2">Due Date</label>
                  <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full p-3 bg-[#f5f4f0] border border-[#e5e0d8] rounded-xl focus:ring-2 focus:ring-[#2d2a26] focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#8b8175] uppercase tracking-wider mb-2">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-3 bg-[#f5f4f0] border border-[#e5e0d8] rounded-xl focus:ring-2 focus:ring-[#2d2a26] focus:outline-none transition-all">
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Paid">Paid (Full)</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-[#2d2a26]">Line Items</h3>
                  <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm font-bold text-[#8b8175] hover:text-[#2d2a26] transition-colors">
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-3 items-end">
                      <div className="flex-1 w-full">
                        <input type="text" placeholder="Description" value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} className="w-full p-3 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl focus:ring-2 focus:ring-[#2d2a26] focus:outline-none" />
                      </div>
                      <div className="w-full md:w-24">
                        <input type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="w-full p-3 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl focus:ring-2 focus:ring-[#2d2a26] focus:outline-none" />
                      </div>
                      <div className="w-full md:w-32">
                        <input type="number" placeholder="Rate (₹)" value={item.rate} onChange={e => handleItemChange(idx, 'rate', e.target.value)} className="w-full p-3 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl focus:ring-2 focus:ring-[#2d2a26] focus:outline-none" />
                      </div>
                      <div className="w-full md:w-32 px-4 py-3 bg-[#f5f4f0] border border-[#e5e0d8] rounded-xl text-[#2d2a26] font-bold flex items-center justify-between">
                        <span className="text-[#8b8175] text-xs">₹</span> {item.amount}
                      </div>
                      <button type="button" onClick={() => removeItem(idx)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50" disabled={formData.items.length === 1}>
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#e5e0d8]">
                <div>
                   <label className="block text-sm font-bold text-[#8b8175] uppercase tracking-wider mb-2">Notes</label>
                   <textarea rows="4" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-3 bg-[#f5f4f0] border border-[#e5e0d8] rounded-xl focus:ring-2 focus:ring-[#2d2a26] focus:outline-none transition-all resize-none" placeholder="Thank you for your business..." />
                </div>
                <div className="bg-[#fcfbf9] p-6 rounded-2xl border border-[#e5e0d8] space-y-3 h-fit">
                   <div className="flex justify-between text-sm text-[#8b8175] font-bold"><span>Subtotal:</span> <span>₹{subtotal.toLocaleString()}</span></div>
                   <div className="flex justify-between text-sm text-[#8b8175] font-bold items-center">
                     <span>Tax ({formData.taxRate}%):</span> 
                     <input type="number" value={formData.taxRate} onChange={e => setFormData({...formData, taxRate: e.target.value})} className="w-16 p-1 text-right border border-[#e5e0d8] rounded-md" />
                   </div>
                   <div className="flex justify-between text-sm text-[#8b8175] font-bold items-center">
                     <span>Discount:</span> 
                     <input type="number" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} className="w-24 p-1 text-right border border-[#e5e0d8] rounded-md" />
                   </div>
                   <div className="pt-3 mt-3 border-t border-[#e5e0d8] flex justify-between text-lg font-extrabold text-[#2d2a26]">
                     <span>Total Amount:</span> <span>₹{total.toLocaleString()}</span>
                   </div>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-[#e5e0d8] bg-[#fcfbf9] flex justify-end gap-3">
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-[#8b8175] hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={() => onSubmit(formData)} className="px-6 py-2.5 rounded-xl font-bold bg-[#2d2a26] text-white hover:bg-black transition-colors shadow-md hover:shadow-lg">
                {initialData ? 'Update Invoice' : 'Generate Invoice'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
