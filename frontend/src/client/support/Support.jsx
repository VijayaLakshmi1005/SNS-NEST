import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { Send, Paperclip, Plus, RefreshCw, MessageSquare } from 'lucide-react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';
import moment from 'moment';
import { useAuthStore } from '../../store/useAuthStore';

export default function Support() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const messagesEndRef = useRef(null);

  // New Ticket Form State
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'General', priority: 'Medium', message: '' });

  useEffect(() => {
    let token = '';
    try {
      const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      token = authData?.state?.token || '';
    } catch (e) {}

    const backendUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');
    const socket = io(backendUrl, { auth: { token } });

    socket.on('ticket_created', () => queryClient.invalidateQueries(['clientTickets']));
    socket.on('ticket_updated', (tkt) => {
      queryClient.invalidateQueries(['clientTickets']);
      if (selectedTicket?._id === tkt._id) setSelectedTicket(tkt);
    });
    
    if (selectedTicket) {
      socket.on(`message_sent_${selectedTicket._id}`, () => {
        queryClient.invalidateQueries(['clientMessages', selectedTicket._id]);
      });
    }

    return () => socket.disconnect();
  }, [queryClient, selectedTicket]);

  const { data: ticketsData, isLoading: loadingTickets } = useQuery({
    queryKey: ['clientTickets'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/support-tickets`, { params: { client: user?._id } });
      return res.data.data;
    },
    enabled: !!user
  });

  const tickets = ticketsData?.tickets || [];

  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['clientMessages', selectedTicket?._id],
    queryFn: async () => {
      if (!selectedTicket) return [];
      const res = await axios.get(`${API_URL}/support-tickets/${selectedTicket._id}/messages`);
      return res.data.data;
    },
    enabled: !!selectedTicket
  });

  const replyMutation = useMutation({
    mutationFn: async (payload) => {
      await axios.post(`${API_URL}/support-tickets/${selectedTicket._id}/messages`, payload);
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries(['clientMessages', selectedTicket._id]);
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      await axios.post(`${API_URL}/support-tickets`, payload);
    },
    onSuccess: () => {
      setIsCreating(false);
      setNewTicket({ subject: '', category: 'General', priority: 'Medium', message: '' });
      queryClient.invalidateQueries(['clientTickets']);
    }
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedTicket) return;
    replyMutation.mutate({ message });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({
      subject: newTicket.subject,
      category: newTicket.category,
      priority: newTicket.priority,
      initialMessage: newTicket.message
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
      
      {/* Left Panel */}
      <div className="w-full md:w-[350px] flex flex-col bg-[#F9F6F0] rounded-2xl border border-[#E3D5CA] shadow-sm overflow-hidden flex-shrink-0 h-full">
        <div className="p-5 border-b border-[#E3D5CA] bg-white flex justify-between items-center">
          <h2 className="font-bold text-xl text-[#1A1210] font-cormorant">My Tickets</h2>
          <button 
            onClick={() => { setIsCreating(true); setSelectedTicket(null); }}
            className="p-2 bg-[#1A1210] text-white rounded-full hover:bg-black transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-[#F9F6F0]">
          {loadingTickets ? (
            <div className="p-8 flex justify-center"><RefreshCw className="w-6 h-6 text-[#8b8175] animate-spin" /></div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-[#8b8175] text-sm font-nav-style">No support tickets found.</div>
          ) : (
            tickets.map(ticket => (
              <div 
                key={ticket._id}
                onClick={() => { setSelectedTicket(ticket); setIsCreating(false); }}
                className={`p-4 border-b border-[#E3D5CA] cursor-pointer transition-all ${selectedTicket?._id === ticket._id ? 'bg-white border-l-4 border-l-[#1A1210]' : 'hover:bg-white border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-[#8b8175] tracking-wider">{ticket.ticketNumber}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                    ticket.status === 'Resolved' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                <h3 className="font-bold text-[#1A1210] text-sm mb-1 truncate">{ticket.subject}</h3>
                <div className="flex justify-between items-center text-[10px] font-medium text-[#8b8175]">
                  <span>{ticket.category}</span>
                  <span>{moment(ticket.updatedAt).fromNow()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-[#E3D5CA] shadow-sm overflow-hidden h-full">
        {isCreating ? (
          <div className="p-6 md:p-10 flex-1 overflow-y-auto">
            <h2 className="text-3xl font-cormorant text-[#1A1210] mb-6 font-bold">Open New Ticket</h2>
            <form onSubmit={handleCreate} className="space-y-6 max-w-xl">
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-[#8b8175] mb-2">Subject</label>
                <input type="text" required value={newTicket.subject} onChange={e => setNewTicket({...newTicket, subject: e.target.value})} className="w-full px-4 py-3 bg-[#F9F6F0] border border-[#E3D5CA] rounded-xl text-sm focus:outline-none focus:border-[#1A1210]" placeholder="Brief description of the issue" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-semibold text-[#8b8175] mb-2">Category</label>
                  <select value={newTicket.category} onChange={e => setNewTicket({...newTicket, category: e.target.value})} className="w-full px-4 py-3 bg-[#F9F6F0] border border-[#E3D5CA] rounded-xl text-sm focus:outline-none focus:border-[#1A1210] appearance-none">
                    <option>General</option>
                    <option>Project</option>
                    <option>Payment</option>
                    <option>Consultation</option>
                    <option>Technical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-semibold text-[#8b8175] mb-2">Priority</label>
                  <select value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value})} className="w-full px-4 py-3 bg-[#F9F6F0] border border-[#E3D5CA] rounded-xl text-sm focus:outline-none focus:border-[#1A1210] appearance-none">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-[#8b8175] mb-2">Details</label>
                <textarea required value={newTicket.message} onChange={e => setNewTicket({...newTicket, message: e.target.value})} rows="5" className="w-full px-4 py-3 bg-[#F9F6F0] border border-[#E3D5CA] rounded-xl text-sm focus:outline-none focus:border-[#1A1210]" placeholder="Please provide as much detail as possible..." />
              </div>
              <button disabled={createMutation.isPending} type="submit" className="px-8 py-3 bg-[#1A1210] text-white font-bold rounded-xl hover:bg-black transition-colors w-full md:w-auto">
                {createMutation.isPending ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </div>
        ) : selectedTicket ? (
          <>
            <div className="p-4 md:p-6 border-b border-[#E3D5CA] bg-white flex justify-between items-center shadow-sm z-10">
              <div>
                <h2 className="font-bold text-lg text-[#1A1210] leading-tight">{selectedTicket.subject}</h2>
                <p className="text-xs text-[#8b8175] mt-0.5">Ticket: {selectedTicket.ticketNumber} • {selectedTicket.category}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F9F6F0] space-y-6">
              {loadingMessages ? (
                <div className="flex justify-center"><RefreshCw className="w-6 h-6 text-[#8b8175] animate-spin" /></div>
              ) : (
                messages?.map((msg) => {
                  if (msg.isInternalNote) return null; // Don't show internal notes to client
                  const isClient = msg.sender?.role === 'client';
                  return (
                    <div key={msg._id} className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-baseline gap-2 mb-1 px-1">
                        <span className="text-[11px] font-bold text-[#8b8175]">{msg.sender?.fullName}</span>
                        <span className="text-[9px] text-gray-400">{moment(msg.createdAt).format('LT')}</span>
                      </div>
                      <div className={`max-w-[75%] p-4 shadow-sm relative ${
                        isClient ? 'bg-[#1A1210] text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-[#E3D5CA] text-[#1A1210] rounded-2xl rounded-tl-sm'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {selectedTicket.status !== 'Closed' && selectedTicket.status !== 'Resolved' && (
              <div className="p-4 bg-white border-t border-[#E3D5CA]">
                <form onSubmit={handleSend} className="flex gap-2 items-end">
                  <button type="button" className="p-3.5 text-[#8b8175] hover:bg-[#F9F6F0] rounded-xl transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your reply..." 
                    className="flex-1 px-4 py-3 min-h-[50px] max-h-[150px] resize-none bg-[#F9F6F0] border border-[#E3D5CA] rounded-xl text-sm focus:outline-none focus:border-[#1A1210]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                  />
                  <button 
                    type="submit"
                    disabled={!message.trim() || replyMutation.isPending}
                    className="p-3.5 rounded-xl transition-colors shadow-sm bg-[#1A1210] hover:bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {replyMutation.isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
              </div>
            )}
            
            {(selectedTicket.status === 'Closed' || selectedTicket.status === 'Resolved') && (
              <div className="p-4 bg-gray-50 border-t border-[#E3D5CA] text-center">
                <p className="text-sm text-[#8b8175] font-semibold flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  This ticket has been marked as {selectedTicket.status.toLowerCase()}.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#8b8175] bg-[#F9F6F0]">
            <div className="w-24 h-24 bg-white shadow-sm border border-[#E3D5CA] rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-[#d0c9bd]" />
            </div>
            <h3 className="font-bold text-xl text-[#1A1210] mb-2 font-cormorant">No Ticket Selected</h3>
            <p className="text-sm max-w-xs text-center font-nav-style">Select a ticket from the list or create a new one to get support.</p>
          </div>
        )}
      </div>
    </div>
  );
}
