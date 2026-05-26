import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Heart, Edit3, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

export default function CatalogItemDrawer({ isOpen, onClose, item }) {
  const queryClient = useQueryClient();

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
                <button className="p-2 text-[#8b8175] hover:bg-[#fcfbf9] rounded-full transition-colors">
                  <Edit3 className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="p-2 text-[#8b8175] hover:bg-[#fcfbf9] rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
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

            </div>

            {/* Footer */}
            <div className="p-6 bg-white border-t border-[#e5e0d8]">
              <button className="w-full py-3 bg-[#2d2a26] text-white rounded-xl font-medium text-sm hover:bg-[#1a1816] transition-colors flex justify-center items-center gap-2 shadow-md">
                <ExternalLink className="w-4 h-4" /> View on Live Website
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
