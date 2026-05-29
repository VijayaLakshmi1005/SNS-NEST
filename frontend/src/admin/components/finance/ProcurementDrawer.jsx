import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud } from 'lucide-react';

export default function ProcurementDrawer({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    category: 'Procurement',
    description: '',
    amount: '',
    date: '',
    status: 'Approved'
  });

  const [file, setFile] = useState(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        category: initialData.category || 'Procurement',
        description: initialData.description || '',
        amount: initialData.amount || '',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
        status: initialData.status || 'Approved'
      });
      setFile(null);
    } else if (isOpen) {
      setFormData({ category: 'Procurement', description: '', amount: '', date: new Date().toISOString().split('T')[0], status: 'Approved' });
      setFile(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (file) {
      data.append('receipt', file);
    }
    onSubmit(data);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#2d2a26]/40 backdrop-blur-sm">
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white shadow-2xl w-full max-w-md h-full flex flex-col border-l border-[#e5e0d8]"
          >
            <div className="flex justify-between items-center p-6 border-b border-[#e5e0d8] bg-[#fcfbf9]">
              <h2 className="text-xl font-bold text-[#2d2a26] font-nav-style">
                {initialData ? 'Edit Expense' : 'Add Procurement Expense'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#8b8175]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#8b8175] uppercase tracking-wider mb-2">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-3 bg-[#f5f4f0] border border-[#e5e0d8] rounded-xl focus:ring-2 focus:ring-[#2d2a26] focus:outline-none transition-all">
                  <option value="Procurement">Materials / Procurement</option>
                  <option value="Salary">Salary</option>
                  <option value="Logistics">Logistics & Transport</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Software">Software & IT</option>
                  <option value="Other">Other Expenses</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#8b8175] uppercase tracking-wider mb-2">Description</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 bg-[#f5f4f0] border border-[#e5e0d8] rounded-xl focus:ring-2 focus:ring-[#2d2a26] focus:outline-none transition-all resize-none" placeholder="Detailed description of the expense..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#8b8175] uppercase tracking-wider mb-2">Amount (₹)</label>
                <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-3 bg-[#f5f4f0] border border-[#e5e0d8] rounded-xl focus:ring-2 focus:ring-[#2d2a26] focus:outline-none transition-all text-xl font-bold text-[#2d2a26]" placeholder="0.00" />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#8b8175] uppercase tracking-wider mb-2">Date</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-3 bg-[#f5f4f0] border border-[#e5e0d8] rounded-xl focus:ring-2 focus:ring-[#2d2a26] focus:outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#8b8175] uppercase tracking-wider mb-2">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-3 bg-[#f5f4f0] border border-[#e5e0d8] rounded-xl focus:ring-2 focus:ring-[#2d2a26] focus:outline-none transition-all">
                  <option value="Pending">Pending (Unpaid)</option>
                  <option value="Approved">Approved</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[#e5e0d8]">
                <label className="block text-sm font-bold text-[#8b8175] uppercase tracking-wider mb-2">Upload Bill / Receipt</label>
                <label className="border-2 border-dashed border-[#e5e0d8] rounded-xl p-8 flex flex-col items-center justify-center bg-[#fcfbf9] text-[#8b8175] cursor-pointer hover:bg-[#f5f4f0] transition-colors overflow-hidden relative">
                   <input type="file" className="hidden" accept="image/*,application/pdf" onChange={e => setFile(e.target.files[0])} />
                   {file ? (
                     <div className="text-center">
                       <span className="font-bold text-[#2d2a26] text-sm break-all">{file.name}</span>
                       <p className="text-xs text-green-600 mt-1">Ready to upload</p>
                     </div>
                   ) : initialData?.receiptUrl ? (
                     <div className="text-center">
                       <img src={initialData.receiptUrl} alt="Receipt" className="h-16 object-contain mb-2 mx-auto rounded-lg" />
                       <span className="text-xs text-[#2d2a26] font-bold">Current Receipt (Click to change)</span>
                     </div>
                   ) : (
                     <>
                       <UploadCloud className="w-8 h-8 mb-2 opacity-50" />
                       <span className="text-sm font-bold">Click to select document</span>
                     </>
                   )}
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-[#e5e0d8] bg-[#fcfbf9] flex flex-col gap-3">
              <button onClick={handleSubmit} className="w-full py-3.5 rounded-xl font-bold bg-[#2d2a26] text-white hover:bg-black transition-colors shadow-md hover:shadow-lg">
                {initialData ? 'Update Expense' : 'Save Expense Record'}
              </button>
              <button onClick={onClose} className="w-full py-3.5 rounded-xl font-bold text-[#8b8175] hover:bg-gray-100 transition-colors">
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
