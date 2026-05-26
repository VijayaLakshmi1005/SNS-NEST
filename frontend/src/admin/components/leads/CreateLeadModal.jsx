import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

export default function CreateLeadModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    city: '',
    propertyClassification: '',
    roomLayout: '',
    preferredStyle: '',
    budget: '',
    source: 'Organic',
    requirements: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formattedData = {
        ...formData,
        propertyType: formData.propertyClassification && formData.roomLayout 
          ? `${formData.propertyClassification} - ${formData.roomLayout}` 
          : formData.propertyClassification || formData.roomLayout || ''
      };
      
      await axios.post(`${API_URL}/leads`, formattedData, { withCredentials: true });
      queryClient.invalidateQueries(['admin-leads']);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to capture lead');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#2d2a26]/20 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-[#e5e0d8] overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-[#e5e0d8] flex justify-between items-center bg-[#fcfbf9]">
            <h2 className="text-xl font-bold font-nav-style text-[#2d2a26]">Capture New Lead</h2>
            <button onClick={onClose} className="p-2 hover:bg-[#e5e0d8] rounded-xl transition-colors">
              <X className="w-5 h-5 text-[#8b8175]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2d2a26]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Mobile Number</label>
                <input required type="text" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2d2a26]" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Email Address</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2d2a26]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Property Classification</label>
                <select value={formData.propertyClassification} onChange={e => setFormData({...formData, propertyClassification: e.target.value})} className="w-full bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2d2a26]">
                  <option value="">Select Type</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Office">Office</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Room Layout</label>
                <select value={formData.roomLayout} onChange={e => setFormData({...formData, roomLayout: e.target.value})} className="w-full bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2d2a26]">
                  <option value="">Select Layout</option>
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK</option>
                  <option value="Villa">Villa</option>
                  <option value="Office">Office</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Estimated Budget</label>
                <input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2d2a26]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Location (City)</label>
                <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2d2a26]" placeholder="e.g. Mumbai" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Preferred Style</label>
                <select value={formData.preferredStyle} onChange={e => setFormData({...formData, preferredStyle: e.target.value})} className="w-full bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2d2a26]">
                  <option value="">Select Style</option>
                  <option value="Minimal">Minimal</option>
                  <option value="Vintage">Vintage</option>
                  <option value="Family Room">Family Room</option>
                  <option value="Modern">Modern</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Scandinavian">Scandinavian</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Bohemian">Bohemian</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Lead Source</label>
                <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2d2a26]">
                  <option value="Organic">Organic</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Referral">Referral</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Initial Requirements</label>
              <textarea rows={3} value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} className="w-full bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2d2a26] resize-none"></textarea>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-[#e5e0d8]">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#8b8175] hover:bg-[#fcfbf9] transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="bg-[#2d2a26] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1a1816] transition-all shadow-sm shadow-[#2d2a26]/20 disabled:opacity-50">
                {loading ? 'Capturing...' : 'Capture Lead'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
