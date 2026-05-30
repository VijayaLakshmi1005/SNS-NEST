import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Heart, Edit3, Trash2, Save, XCircle } from 'lucide-react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

const CATEGORIES = ['Minimal', 'Vintage', 'Modern'];
const TIERS = ['Basic', 'Standard', 'Premium', 'Luxury'];
const TYPES = [
  'Residential Interior Design', 'Living Room Design', 'Bedroom Design', 
  'Modular Kitchen Design', 'Wardrobe Design', 'False Ceiling Design', 
  'TV Unit Design', 'Space Planning',
  'Commercial Interior Design', 'Office Interiors', 'Retail Shop Interiors', 
  'Showroom Design', 'Reception Area Design'
];

export default function CatalogItemDrawer({ isOpen, onClose, item }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || item.name || '',
        description: item.description || '',
        category: item.category || '',
        type: item.type || '',
        format: item.format || 'Service',
        tier: item.tier || 'Standard',
        basePrice: item.pricing?.basePrice || 0
      });
      setIsEditing(false);
    }
  }, [item]);

  if (!item) return null;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_URL}/catalog/${item._id}`, { withCredentials: true });
        queryClient.invalidateQueries(['admin-catalog']);
        onClose();
      } catch (err) {
        alert('Failed to delete item');
      }
    }
  };

  const handleSave = async () => {
    try {
      await axios.patch(`${API_URL}/catalog/${item._id}`, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        format: formData.format,
        tier: formData.tier,
        pricing: {
          ...item.pricing,
          basePrice: Number(formData.basePrice)
        }
      }, { withCredentials: true });
      queryClient.invalidateQueries(['admin-catalog']);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update item');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2d2a26]/20 backdrop-blur-sm z-50"
          />
          <motion.div 
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-lg bg-[#f5f2eb] shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white border-b border-[#e5e0d8]">
              <div>
                <h2 className="font-nav-style text-xl font-bold text-[#2d2a26] truncate">{item.title || item.name || 'Untitled'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-[#fcfbf9] border border-[#e5e0d8] rounded text-[10px] font-bold text-[#8b8175] uppercase tracking-wider">
                    {item.type}
                  </span>
                  <span className="text-xs text-[#8b8175]">{item.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
                {isEditing ? (
                  <button onClick={() => setIsEditing(false)} className="p-2 text-[#8b8175] hover:bg-[#fcfbf9] rounded-full transition-colors">
                    <XCircle className="w-5 h-5" />
                  </button>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="p-2 text-[#8b8175] hover:bg-[#fcfbf9] rounded-full transition-colors">
                    <Edit3 className="w-5 h-5" />
                  </button>
                )}
                <button onClick={onClose} className="p-2 text-[#8b8175] hover:bg-[#fcfbf9] rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#8b8175] uppercase tracking-wider mb-1">Title</label>
                    <input 
                      type="text" 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-[#e5e0d8] rounded-xl text-sm outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#8b8175] uppercase tracking-wider mb-1">Category</label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-[#e5e0d8] rounded-xl text-sm outline-none"
                      >
                        <option value="">Select Category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#8b8175] uppercase tracking-wider mb-1">Tier</label>
                      <select 
                        value={formData.tier}
                        onChange={e => setFormData({...formData, tier: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-[#e5e0d8] rounded-xl text-sm outline-none"
                      >
                        {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8b8175] uppercase tracking-wider mb-1">Type</label>
                    <select 
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-[#e5e0d8] rounded-xl text-sm outline-none"
                    >
                      <option value="">Select Type</option>
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8b8175] uppercase tracking-wider mb-1">Format</label>
                    <select 
                      value={formData.format}
                      onChange={e => setFormData({...formData, format: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-[#e5e0d8] rounded-xl text-sm outline-none"
                    >
                      <option value="Service">Service</option>
                      <option value="Product">Product</option>
                      <option value="Concept">Concept</option>
                      <option value="Package">Package</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8b8175] uppercase tracking-wider mb-1">Base Price (INR)</label>
                    <input 
                      type="number" 
                      value={formData.basePrice} 
                      onChange={e => setFormData({...formData, basePrice: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-[#e5e0d8] rounded-xl text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8b8175] uppercase tracking-wider mb-1">Description</label>
                    <textarea 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-[#e5e0d8] rounded-xl text-sm outline-none min-h-[100px]"
                    />
                  </div>
                  <button 
                    onClick={handleSave}
                    className="w-full py-3 bg-[#656D4A] text-white rounded-xl font-medium text-sm hover:bg-[#525a3a] transition-colors flex justify-center items-center gap-2 shadow-md"
                  >
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              ) : (
                <>
                  {/* Media Gallery */}
                  {item.images && item.images.length > 0 && (
                    <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-[#e5e0d8]">
                      <img src={item.images[0].url} alt={item.title} className="w-full h-auto object-cover" />
                    </div>
                  )}

                  {/* Stats Bar */}
                  <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-[#e5e0d8]">
                    <div className="flex-1 text-center">
                      <div className="text-xs text-[#8b8175] uppercase tracking-wider font-semibold mb-1">Views</div>
                      <div className="text-lg font-bold text-[#2d2a26]">{item.stats?.views || 0}</div>
                    </div>
                    <div className="w-px bg-[#e5e0d8]"></div>
                    <div className="flex-1 text-center">
                      <div className="text-xs text-[#8b8175] uppercase tracking-wider font-semibold mb-1">Saves</div>
                      <div className="text-lg font-bold text-[#2d2a26]">{item.stats?.wishlistSaves || 0}</div>
                    </div>
                    <div className="w-px bg-[#e5e0d8]"></div>
                    <div className="flex-1 text-center">
                      <div className="text-xs text-[#8b8175] uppercase tracking-wider font-semibold mb-1">Price</div>
                      <div className="text-lg font-bold text-[#2d2a26]">{item.pricing?.currency} {item.pricing?.basePrice}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider mb-2">Description / AI Extracted</h3>
                    <div className="p-4 bg-white rounded-2xl text-sm text-[#2d2a26] leading-relaxed shadow-sm border border-[#e5e0d8]">
                      {item.description}
                    </div>
                  </div>

                  {/* AI Tags */}
                  <div>
                    <h3 className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider mb-2">AI Generated Tags</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-[10px] text-[#8b8175] uppercase mb-1">Styles</div>
                        <div className="flex flex-wrap gap-2">
                          {item.styles?.map(s => <span key={s} className="px-3 py-1 bg-white border border-[#e5e0d8] rounded-full text-xs text-[#2d2a26]">{s}</span>)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#8b8175] uppercase mb-1">Room Types</div>
                        <div className="flex flex-wrap gap-2">
                          {item.roomTypes?.map(r => <span key={r} className="px-3 py-1 bg-white border border-[#e5e0d8] rounded-full text-xs text-[#2d2a26]">{r}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

            </div>

            {/* Footer */}
            {!isEditing && (
              <div className="p-6 bg-white border-t border-[#e5e0d8]">
                <button 
                  onClick={() => window.open('/client/designs', '_blank')}
                  className="w-full py-3 bg-[#2d2a26] text-white rounded-xl font-medium text-sm hover:bg-[#1a1816] transition-colors flex justify-center items-center gap-2 shadow-md"
                >
                  <ExternalLink className="w-4 h-4" /> View on Live Website
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
