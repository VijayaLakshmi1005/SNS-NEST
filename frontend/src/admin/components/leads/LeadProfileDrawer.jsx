import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, Phone, Mail, MessageSquare, CheckCircle, BrainCircuit, Calendar, ArrowRight } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

function LeadTimeline({ leadId }) {
  const queryClient = useQueryClient();
  
  const { data: activityQuery } = useQuery({
    queryKey: ['admin-lead-activity', leadId],
    queryFn: async () => {
      // The API currently returns { lead, activities } in /leads/:id
      const res = await axios.get(`${API_URL}/leads/${leadId}`, { withCredentials: true });
      return res.data;
    },
    enabled: !!leadId
  });
  
  const activities = activityQuery?.data?.activities || [];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold font-nav-style text-[#2d2a26] mb-4">Lead Timeline</h3>
      <div className="relative border-l-2 border-[#e5e0d8] ml-4 space-y-8 pb-4">
        {activities.map((activity, index) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            key={activity._id} 
            className="relative pl-6"
          >
            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-[#2d2a26]" />
            <div className="bg-white p-4 rounded-xl border border-[#e5e0d8] shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-[#2d2a26]">{activity.action}</h4>
                <span className="text-xs text-[#8b8175]">
                  {new Date(activity.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
              <p className="text-sm text-[#8b8175]">{activity.details}</p>
            </div>
          </motion.div>
        ))}
        {activities.length === 0 && (
          <p className="pl-6 text-sm text-[#8b8175]">No activity recorded yet.</p>
        )}
      </div>
    </div>
  );
}

function LeadNotes({ leadId }) {
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState('');
  
  const { data: leadQuery } = useQuery({
    queryKey: ['admin-lead', leadId],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/leads/${leadId}`, { withCredentials: true });
      return res.data;
    },
    enabled: !!leadId
  });
  
  const activities = leadQuery?.data?.activities?.filter(a => a.type === 'message') || [];

  const handleSendNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await axios.post(`${API_URL}/leads/${leadId}/notes`, { text: newNote }, { withCredentials: true });
      setNewNote('');
      // Optimistic update would go here, but sockets will refresh it anyway
    } catch (err) {}
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-bold font-nav-style text-[#2d2a26] mb-4">Internal Notes & Comms</h3>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {activities.map(note => (
          <div key={note._id} className="bg-white p-4 rounded-2xl border border-[#e5e0d8] shadow-sm">
            <p className="text-sm text-[#2d2a26] mb-2">{note.details}</p>
            <p className="text-[10px] text-[#8b8175] font-medium text-right">
               {new Date(note.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-center py-10 text-[#8b8175] text-sm border-2 border-dashed border-[#e5e0d8] rounded-2xl">
            No notes or messages yet. Start the conversation.
          </div>
        )}
      </div>

      <form onSubmit={handleSendNote} className="flex gap-2">
        <input 
          type="text" 
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          placeholder="Add an internal note or message..."
          className="flex-1 bg-white border border-[#e5e0d8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2d2a26]"
        />
        <button type="submit" className="bg-[#2d2a26] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#1a1816] transition-colors">
          Send
        </button>
      </form>
    </div>
  );
}

export default function LeadProfileDrawer({ leadId, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('profile');
  const queryClient = useQueryClient();

  const { data: leadQuery, refetch: refetchLead } = useQuery({
    queryKey: ['admin-lead', leadId],
    queryFn: async () => {
      if (!leadId) return null;
      const res = await axios.get(`${API_URL}/leads/${leadId}`, { withCredentials: true });
      return res.data;
    },
    enabled: !!leadId
  });

  const lead = leadQuery?.data?.lead;

  useEffect(() => {
    if (!isOpen || !leadId) return;

    const socket = io(API_URL.replace('/api', ''), {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.emit('joinLeadRoom', leadId); // We would need a backend room, but standard broadcast also works for now

    socket.on('leadUpdated', () => {
      refetchLead();
      queryClient.invalidateQueries(['admin-leads']);
    });
    
    socket.on('leadActivity', () => {
      refetchLead();
    });

    return () => socket.disconnect();
  }, [isOpen, leadId, refetchLead, queryClient]);

  const handleConvert = async () => {
    if (!window.confirm("Convert this lead into a client & project?")) return;
    try {
      await axios.post(`${API_URL}/leads/${leadId}/convert`, {}, { withCredentials: true });
      queryClient.invalidateQueries(['admin-leads']);
      onClose(); // close drawer since they are converted
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to convert lead');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#2d2a26]/20 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-2xl bg-[#fcfbf9] h-full shadow-2xl border-l border-[#e5e0d8] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#e5e0d8] bg-white flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {lead?.status || 'Loading...'}
                </span>
                <span className="text-xs font-medium text-[#8b8175] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Source: {lead?.source}
                </span>
              </div>
              <h2 className="text-3xl font-extrabold font-nav-style text-[#2d2a26]">{lead?.name || 'Loading...'}</h2>
              <div className="flex gap-4 mt-2">
                <p className="text-[#8b8175] text-sm flex items-center gap-1"><Mail className="w-3.5 h-3.5"/> {lead?.email}</p>
                <p className="text-[#8b8175] text-sm flex items-center gap-1"><Phone className="w-3.5 h-3.5"/> {lead?.mobile}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={onClose}
                className="p-2 bg-white border border-[#e5e0d8] hover:bg-[#fcfbf9] rounded-xl text-[#8b8175] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              {lead?.status !== 'Converted' && (
                <button onClick={handleConvert} className="mt-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1 shadow-sm shadow-green-200">
                   <CheckCircle className="w-4 h-4" /> Convert to Client
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 border-b border-[#e5e0d8] bg-white flex items-center gap-6 overflow-x-auto">
            {['profile', 'activity', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-semibold capitalize transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-[#2d2a26] text-[#2d2a26]'
                    : 'border-transparent text-[#8b8175] hover:text-[#2d2a26]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#fcfbf9]">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                
                {/* AI Scoring Box */}
                <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm shadow-blue-50 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="flex items-center gap-2 mb-3">
                    <BrainCircuit className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-semibold text-[#8b8175] uppercase tracking-wider">AI Qualification Score</h3>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className={`text-4xl font-extrabold font-nav-style ${lead?.probabilityScore >= 70 ? 'text-green-600' : lead?.probabilityScore >= 30 ? 'text-orange-500' : 'text-red-500'}`}>
                      {lead?.probabilityScore || 0}/100
                    </span>
                    <span className="text-sm text-[#8b8175] pb-1 font-medium">Conversion Probability</span>
                  </div>
                  <p className="text-sm text-blue-800 bg-blue-50 px-3 py-2 rounded-lg mt-4 border border-blue-100">
                    {lead?.aiQualificationNotes || 'Analyzing lead intent...'}
                  </p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white p-4 rounded-xl border border-[#e5e0d8] shadow-sm">
                      <p className="text-xs text-[#8b8175] font-semibold uppercase tracking-wider mb-1">Budget</p>
                      <p className="text-lg font-bold text-[#2d2a26]">₹{(lead?.budget || 0).toLocaleString()}</p>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-[#e5e0d8] shadow-sm">
                      <p className="text-xs text-[#8b8175] font-semibold uppercase tracking-wider mb-1">Property</p>
                      <p className="text-lg font-bold text-[#2d2a26]">{lead?.propertyType || 'Unknown'}</p>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-[#e5e0d8] shadow-sm">
                      <p className="text-xs text-[#8b8175] font-semibold uppercase tracking-wider mb-1">Location</p>
                      <p className="text-lg font-bold text-[#2d2a26]">{lead?.city || 'Unknown'}</p>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-[#e5e0d8] shadow-sm">
                      <p className="text-xs text-[#8b8175] font-semibold uppercase tracking-wider mb-1">Preferred Style</p>
                      <p className="text-lg font-bold text-[#2d2a26]">{lead?.preferredStyle || 'Unknown'}</p>
                   </div>
                </div>

                {/* Requirements */}
                <div className="bg-white p-6 rounded-2xl border border-[#e5e0d8] shadow-sm">
                   <h3 className="text-sm font-semibold text-[#8b8175] uppercase tracking-wider mb-3">Client Requirements</h3>
                   <p className="text-sm text-[#2d2a26] whitespace-pre-wrap leading-relaxed">
                     {lead?.requirements || 'No specific requirements captured yet.'}
                   </p>
                </div>

              </div>
            )}
            
            {activeTab === 'activity' && (
              <LeadTimeline leadId={leadId} />
            )}

            {activeTab === 'notes' && (
              <LeadNotes leadId={leadId} />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
