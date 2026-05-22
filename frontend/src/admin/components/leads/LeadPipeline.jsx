import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Phone, Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://sns-nest-backend.onrender.com');

const COLUMNS = [
  'New Lead', 'Contacted', 'Interested', 'Consultation Scheduled', 
  'Proposal Sent', 'Negotiation', 'Converted', 'Closed Lost'
];

export default function LeadPipeline({ leads = [] }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true, transports: ['websocket', 'polling'] });
    
    socket.on('leadUpdated', (updatedLead) => {
      queryClient.setQueryData(['admin-leads'], (old) => {
        if (!old) return old;
        const newData = old.data.map(lead => lead._id === updatedLead._id ? updatedLead : lead);
        return { ...old, data: newData };
      });
    });

    socket.on('newLead', (newLead) => {
      queryClient.setQueryData(['admin-leads'], (old) => {
        if (!old) return { data: [newLead] };
        return { ...old, data: [newLead, ...old.data] };
      });
    });

    return () => socket.disconnect();
  }, [queryClient]);

  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (!leadId) return;

    try {
      // Optimistic update
      queryClient.setQueryData(['admin-leads'], (old) => {
        const newData = old.data.map(lead => lead._id === leadId ? { ...lead, status: newStatus } : lead);
        return { ...old, data: newData };
      });

      // API Call
      await axios.patch(`${API_URL}/leads/${leadId}/status`, { status: newStatus }, { withCredentials: true, transports: ['websocket', 'polling'] });
    } catch (err) {
      console.error("Failed to update lead status", err);
      // Revert optimism if needed (React Query invalidate is safer)
      queryClient.invalidateQueries(['admin-leads']);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x min-h-[600px]">
      {COLUMNS.map((column) => (
        <div 
          key={column} 
          className="flex-shrink-0 w-80 bg-[#fcfbf9] border border-[#e5e0d8] rounded-2xl p-4 snap-center flex flex-col"
          onDrop={(e) => handleDrop(e, column)}
          onDragOver={handleDragOver}
        >
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-nav-style font-bold text-[#2d2a26]">{column}</h3>
            <span className="text-xs font-medium bg-[#e5e0d8] text-[#8b8175] px-2 py-0.5 rounded-full">
              {leads.filter(l => l.status === column).length}
            </span>
          </div>
          
          <div className="flex-1 space-y-3 overflow-y-auto">
            {leads.filter(l => l.status === column).map((lead) => (
              <motion.div
                key={lead._id}
                layoutId={lead._id}
                draggable
                onDragStart={(e) => handleDragStart(e, lead._id)}
                className="bg-white p-4 rounded-xl border border-[#e5e0d8] shadow-sm cursor-grab active:cursor-grabbing hover:border-[#d4cecb] transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-[#2d2a26] text-sm truncate">{lead.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    lead.probabilityScore >= 70 ? 'bg-green-50 text-green-700' :
                    lead.probabilityScore >= 30 ? 'bg-orange-50 text-orange-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {lead.probabilityScore}%
                  </span>
                </div>
                
                <p className="text-xs text-[#8b8175] mb-3 truncate">{lead.email}</p>
                
                <div className="flex items-center justify-between text-xs text-[#8b8175]">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{lead.source}</span>
                  </div>
                  <Link 
                    to={`/admin/leads/${lead._id}`}
                    className="flex items-center gap-1 text-[#2d2a26] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
            {leads.filter(l => l.status === column).length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-[#e5e0d8] rounded-xl text-[#8b8175] text-xs">
                Drop leads here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
