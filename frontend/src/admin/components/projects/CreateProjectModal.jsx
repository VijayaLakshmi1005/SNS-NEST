import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Plus } from 'lucide-react';
import axios from 'axios';
import { useQueryClient, useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

const PROJECT_TYPES = [
  'Residential Interior Design',
  'Living Room Design',
  'Bedroom Design',
  'Modular Kitchen Design',
  'Wardrobe Design',
  'False Ceiling Design',
  'TV Unit Design',
  'Space Planning',
  'Commercial Interior Design',
  'Office Interiors',
  'Retail Shop Interiors',
  'Showroom Design',
  'Reception Area Design'
];

export default function CreateProjectModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  
  // Fetch clients for the dropdown
  const { data: usersQuery } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/admin/users`, { withCredentials: true });
      return res.data;
    },
    enabled: isOpen
  });
  
  const clients = usersQuery?.data?.users?.filter(u => u.role === 'client') || [];

  const [formData, setFormData] = useState({
    title: '',
    projectType: 'Residential Interior Design',
    clientId: '',
    budget: '',
    startDate: '',
    endDate: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientId) {
      alert('Please select a client');
      return;
    }
    
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/projects`, {
        ...formData,
        estimatedCompletion: formData.endDate
      }, { withCredentials: true });
      queryClient.invalidateQueries(['admin-projects']);
      queryClient.invalidateQueries(['admin-projects-analytics']);
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
      alert(error.response?.data?.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#2d2a26]/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-[#fcfbf9] rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="px-8 py-6 border-b border-[#e5e0d8] bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fcfbf9] border border-[#e5e0d8] flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-[#8b8175]" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-nav-style text-[#2d2a26]">Create New Project</h2>
                <p className="text-xs text-[#8b8175]">Initialize a new interior design execution</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-2 text-[#8b8175] hover:bg-[#fcfbf9] rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#2d2a26] mb-1.5">Project Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:border-[#2d2a26] transition-colors"
                  placeholder="e.g. Skyline Penthouse Renovation"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2d2a26] mb-1.5">Assign Client</label>
                <select
                  required
                  value={formData.clientId}
                  onChange={e => setFormData({...formData, clientId: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:border-[#2d2a26] transition-colors"
                >
                  <option value="">Select a Client</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>{client.fullName || `${client.firstName} ${client.lastName}`} ({client.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2d2a26] mb-1.5">Project Type</label>
                <select
                  value={formData.projectType}
                  onChange={e => setFormData({...formData, projectType: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:border-[#2d2a26] transition-colors"
                >
                  {PROJECT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2d2a26] mb-1.5">Estimated Budget (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.budget}
                  onChange={e => setFormData({...formData, budget: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:border-[#2d2a26] transition-colors"
                  placeholder="e.g. 5000000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#2d2a26] mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:border-[#2d2a26] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#2d2a26] mb-1.5">Expected End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:border-[#2d2a26] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#e5e0d8] flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-white border border-[#e5e0d8] text-[#2d2a26] rounded-xl text-sm font-semibold hover:bg-[#fcfbf9] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-[#2d2a26] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1816] transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isLoading ? 'Creating...' : <><Plus className="w-4 h-4" /> Create Project</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
