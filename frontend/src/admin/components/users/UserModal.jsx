import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Lock, Tag, Box } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../../client/utils/api';

export default function UserModal({ isOpen, onClose, user, onSave }) {
  const isEdit = !!user;
  const [designers, setDesigners] = useState([]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    role: 'client',
    clientStatus: 'New Lead',
    assignedDesigner: '',
    crmTags: '',
    isDesigner: false,
  });

  useEffect(() => {
    const fetchDesigners = async () => {
      try {
        const res = await api.get('/admin/users', { params: { limit: 1000 } });
        const allUsers = res.data.data.users || [];
        const filteredDesigners = allUsers.filter(u => 
          (u.role && u.role.toLowerCase() === 'designer') || 
          u.isDesigner === true
        );
        setDesigners(filteredDesigners);
      } catch (err) {
        console.error("Failed to fetch designers", err);
      }
    };
    if (isOpen) fetchDesigners();
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        mobile: user.mobile || '',
        password: '',
        role: user.role || 'client',
        clientStatus: user.clientStatus || 'New Lead',
        assignedDesigner: user.assignedDesigner || user.assignedDesignerDoc?._id || '',
        crmTags: user.crmTags ? user.crmTags.join(', ') : '',
        isDesigner: user.isDesigner || false,
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        mobile: '',
        password: '',
        role: 'client',
        clientStatus: 'New Lead',
        assignedDesigner: '',
        crmTags: '',
        isDesigner: false,
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (!submitData.password && isEdit) delete submitData.password;
    if (submitData.role !== 'client') delete submitData.assignedDesigner;
    if (submitData.assignedDesigner === '') delete submitData.assignedDesigner;
    if (submitData.role !== 'admin') delete submitData.isDesigner;
    submitData.crmTags = submitData.crmTags.split(',').map(t => t.trim()).filter(Boolean);
    onSave(submitData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1a1a1a]/40 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-[#fbfbf9] rounded-2xl shadow-2xl z-[101] overflow-hidden border border-[#e6e6df]"
          >
            <div className="flex items-center justify-between p-6 border-b border-[#e6e6df] bg-white/50">
              <h2 className="text-xl font-playfair font-bold text-[#1a1a1a]">
                {isEdit ? 'Edit CRM Profile' : 'Add New User'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-[#f5f5f0] rounded-full transition-colors">
                <X className="w-5 h-5 text-[#8b8175]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#8b8175] flex items-center gap-2">
                    <User className="w-3 h-3" /> Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#e6e6df] bg-white focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    placeholder="E.g. Sarah Connor"
                  />
                </div>
                
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#8b8175] flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#e6e6df] bg-white focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    placeholder="sarah@example.com"
                  />
                </div>

                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#8b8175] flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    required
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#e6e6df] bg-white focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#8b8175] flex items-center gap-2">
                    <Lock className="w-3 h-3" /> {isEdit ? 'New Password (Optional)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    required={!isEdit}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#e6e6df] bg-white focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#8b8175] flex items-center gap-2">
                    <Box className="w-3 h-3" /> Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#e6e6df] bg-white focus:outline-none focus:border-[#1a1a1a] transition-colors appearance-none"
                  >
                    <option value="client">Client</option>
                    <option value="designer">Designer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <AnimatePresence>
                  {formData.role === 'admin' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      className="space-y-2 col-span-2 sm:col-span-1 flex flex-col justify-end pb-2"
                    >
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          name="isDesigner"
                          checked={formData.isDesigner}
                          onChange={handleChange}
                          className="w-4 h-4 rounded border-[#e6e6df] text-[#1a1a1a] focus:ring-[#1a1a1a]"
                        />
                        <span className="text-sm font-semibold text-[#1a1a1a] group-hover:text-[#8b8175] transition-colors">
                          Admin also acts as Designer
                        </span>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#8b8175] flex items-center gap-2">
                    <Box className="w-3 h-3" /> CRM Status
                  </label>
                  <select
                    name="clientStatus"
                    value={formData.clientStatus}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#e6e6df] bg-white focus:outline-none focus:border-[#1a1a1a] transition-colors appearance-none"
                  >
                    <option value="New Lead">New Lead</option>
                    <option value="FOLLOW-UP">Follow-Up</option>
                    <option value="Active Client">Active Client</option>
                    <option value="Consultation Ongoing">Consultation Ongoing</option>
                    <option value="Project Active">Project Active</option>
                    <option value="High Priority">High Priority</option>
                    <option value="VIP">VIP</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <AnimatePresence>
                  {formData.role === 'client' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      className="space-y-2 col-span-2 sm:col-span-1"
                    >
                      <label className="text-xs uppercase tracking-widest font-semibold text-[#8b8175] flex items-center gap-2">
                        <User className="w-3 h-3" /> Assign Designer
                      </label>
                      <select
                        name="assignedDesigner"
                        value={formData.assignedDesigner}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-[#e6e6df] bg-white focus:outline-none focus:border-[#1a1a1a] transition-colors appearance-none"
                      >
                        <option value="">-- Unassigned --</option>
                        {designers.map(d => (
                          <option key={d._id} value={d._id}>{d.fullName}</option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2 col-span-2">
                  <label className="text-xs uppercase tracking-widest font-semibold text-[#8b8175] flex items-center gap-2">
                    <Tag className="w-3 h-3" /> CRM Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    name="crmTags"
                    value={formData.crmTags}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#e6e6df] bg-white focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    placeholder="e.g. VIP, Requires Follow-up, High Budget"
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-[#e6e6df]">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEdit ? 'Save Changes' : 'Create User'}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
