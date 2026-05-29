import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';

export default function ActionMenu({ onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-[#8b8175] hover:bg-white hover:text-[#2d2a26] hover:shadow-sm border border-transparent hover:border-[#e5e0d8] rounded-lg transition-all"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-36 bg-white border border-[#e5e0d8] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden z-30"
          >
            <div className="py-1">
              {onEdit && (
                <button
                  onClick={() => { setIsOpen(false); onEdit(); }}
                  className="w-full px-4 py-2 text-left text-sm font-bold text-[#2d2a26] hover:bg-[#fcfbf9] flex items-center gap-2 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#8b8175]" /> Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => { setIsOpen(false); onDelete(); }}
                  className="w-full px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" /> Delete
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
