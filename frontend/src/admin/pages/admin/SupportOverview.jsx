import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { Send, Paperclip, Search, CheckCircle, AlertTriangle, Clock, RefreshCw, User, MoreVertical, Star, Shield, Filter, Plus, Calendar, Settings } from 'lucide-react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';
import moment from 'moment';

const getPriorityColor = (priority) => {
  switch(priority) {
    case 'Urgent': return 'bg-red-50 text-red-600 border-red-200';
    case 'High': return 'bg-orange-50 text-orange-600 border-orange-200';
    case 'Medium': return 'bg-blue-50 text-blue-600 border-blue-200';
    default: return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

const getStatusColor = (status) => {
  switch(status) {
    case 'Open': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'Pending Client': return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'Resolved': return 'bg-purple-50 text-purple-600 border-purple-200';
    case 'Escalated': return 'bg-rose-50 text-rose-600 border-rose-200';
    default: return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

export default function SupportOverview() {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [filter, setFilter] = useState('All');
  const messagesEndRef = useRef(null);
  
  // Real-time socket connection
  useEffect(() => {
    let token = '';
    try {
      const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      token = authData?.state?.token || '';
    } catch (e) {}

    const backendUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');
    const socket = io(backendUrl, { auth: { token } });

    socket.on('ticket_created', () => queryClient.invalidateQueries(['tickets']));
    socket.on('ticket_updated', (tkt) => {
      queryClient.invalidateQueries(['tickets']);
      if (selectedTicket?._id === tkt._id) {
        setSelectedTicket(tkt);
      }
    });
    
    if (selectedTicket) {
      socket.on(`message_sent_${selectedTicket._id}`, () => {
        queryClient.invalidateQueries(['messages', selectedTicket._id]);
      });
    }

    return () => socket.disconnect();
  }, [queryClient, selectedTicket]);

  const { data: kpis } = useQuery({
    queryKey: ['support-kpis'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/support-tickets/dashboard`);
      return res.data.data;
    }
  });

  const { data: ticketsData, isLoading: loadingTickets } = useQuery({
    queryKey: ['tickets', filter],
    queryFn: async () => {
      const params = {};
      if (filter !== 'All') params.status = filter;
      const res = await axios.get(`${API_URL}/support-tickets`, { params });
      return res.data.data;
    }
  });

  const tickets = ticketsData?.tickets || [];

  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', selectedTicket?._id],
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
      queryClient.invalidateQueries(['messages', selectedTicket._id]);
    }
  });

  const statusMutation = useMutation({
    mutationFn: async (status) => {
      await axios.patch(`${API_URL}/support-tickets/${selectedTicket._id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tickets']);
    }
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedTicket) return;
    replyMutation.mutate({ message, isInternalNote: isInternal });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6 animate-in fade-in duration-500 pb-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 flex-shrink-0">
        <div className="bg-white p-4 rounded-2xl border border-[#e5e0d8] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#8b8175] uppercase tracking-wider mb-1">Open Tickets</p>
            <h3 className="text-2xl font-bold text-[#2d2a26]">{kpis?.openTickets || 0}</h3>
          </div>
          <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-amber-500" /></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#e5e0d8] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#8b8175] uppercase tracking-wider mb-1">Resolved Today</p>
            <h3 className="text-2xl font-bold text-[#2d2a26]">{kpis?.resolvedToday || 0}</h3>
          </div>
          <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center"><CheckCircle className="w-5 h-5 text-emerald-500" /></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#e5e0d8] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#8b8175] uppercase tracking-wider mb-1">High Priority</p>
            <h3 className="text-2xl font-bold text-[#2d2a26]">{kpis?.highPriority || 0}</h3>
          </div>
          <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center"><Shield className="w-5 h-5 text-rose-500" /></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#e5e0d8] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#8b8175] uppercase tracking-wider mb-1">Active Agents</p>
            <h3 className="text-2xl font-bold text-[#2d2a26]">{kpis?.agentsCount || 0}</h3>
          </div>
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-blue-500" /></div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* LEFT PANEL: Ticket Inbox */}
      <div className="w-[380px] flex flex-col bg-white rounded-2xl border border-[#e5e0d8] shadow-sm overflow-hidden flex-shrink-0">
        <div className="p-5 border-b border-[#e5e0d8] bg-[#fcfbf9]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-[#2d2a26]">Inbox</h2>
            <button className="p-2 hover:bg-[#e5e0d8] rounded-lg transition-colors">
              <Filter className="w-4 h-4 text-[#8b8175]" />
            </button>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
            {['All', 'Open', 'Pending Client', 'Resolved', 'Escalated'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === f ? 'bg-[#2d2a26] text-white' : 'bg-white border border-[#e5e0d8] text-[#8b8175] hover:bg-[#f5f5f0]'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#8b8175]" />
            <input 
              type="text" 
              placeholder="Search tickets..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:border-[#2d2a26] transition-colors shadow-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingTickets ? (
            <div className="p-8 flex justify-center"><RefreshCw className="w-6 h-6 text-[#8b8175] animate-spin" /></div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-[#8b8175] text-sm">No tickets found.</div>
          ) : (
            tickets.map(ticket => (
              <div 
                key={ticket._id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 border-b border-[#e5e0d8] cursor-pointer transition-all ${selectedTicket?._id === ticket._id ? 'bg-[#f5f5f0] border-l-4 border-l-[#2d2a26]' : 'hover:bg-[#fcfbf9] border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] font-bold text-[#8b8175]">{ticket.ticketNumber}</span>
                    <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                <h3 className="font-bold text-[#2d2a26] text-sm mb-1 truncate">{ticket.subject}</h3>
                <p className="text-xs text-[#8b8175] truncate mb-2">{ticket.client?.fullName || 'Unknown Client'}</p>
                <div className="flex justify-between items-center text-[10px] font-medium text-[#8b8175]">
                  <span>{ticket.category}</span>
                  <span>{moment(ticket.updatedAt).fromNow()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CENTER PANEL: Chat Interface */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-[#e5e0d8] shadow-sm overflow-hidden relative">
        {selectedTicket ? (
          <>
            {/* Chat Header */}
            <div className="p-4 md:p-6 border-b border-[#e5e0d8] bg-[#fcfbf9] flex justify-between items-center z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#e5e0d8] flex items-center justify-center text-[#2d2a26] font-bold">
                  {selectedTicket.client?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="font-bold text-lg text-[#2d2a26] leading-tight">{selectedTicket.subject}</h2>
                  <p className="text-xs text-[#8b8175] mt-0.5">
                    {selectedTicket.client?.fullName} • {selectedTicket.ticketNumber}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedTicket.status !== 'Resolved' && (
                  <button 
                    onClick={() => statusMutation.mutate('Resolved')}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> Resolve
                  </button>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#faf9f7] space-y-6">
              {loadingMessages ? (
                <div className="flex justify-center"><RefreshCw className="w-6 h-6 text-[#8b8175] animate-spin" /></div>
              ) : (
                messages?.map((msg) => {
                  const isAdmin = msg.sender?.role === 'admin' || msg.sender?.role === 'designer';
                  return (
                    <div key={msg._id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-baseline gap-2 mb-1 px-1">
                        <span className="text-[11px] font-bold text-[#8b8175]">{msg.sender?.fullName}</span>
                        <span className="text-[9px] text-gray-400">{moment(msg.createdAt).format('LT')}</span>
                      </div>
                      <div className={`max-w-[75%] p-4 shadow-sm relative group ${
                        msg.isInternalNote ? 'bg-amber-100 border border-amber-200 text-amber-900 rounded-2xl rounded-tr-sm' : 
                        isAdmin ? 'bg-[#2d2a26] text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-[#e5e0d8] text-[#2d2a26] rounded-2xl rounded-tl-sm'
                      }`}>
                        {msg.isInternalNote && <span className="absolute -top-2.5 right-4 bg-amber-500 text-white text-[9px] tracking-wider font-bold px-2 py-0.5 rounded-full shadow-sm">INTERNAL NOTE</span>}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        
                        {/* WhatsApp style double ticks for admins */}
                        {isAdmin && !msg.isInternalNote && (
                          <div className="absolute bottom-2 right-3 text-[10px] opacity-70">
                            {msg.isRead ? <span className="text-blue-400">✓✓</span> : <span>✓</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-[#e5e0d8]">
              <form onSubmit={handleSend} className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#8b8175] cursor-pointer hover:text-[#2d2a26] transition-colors">
                    <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="accent-amber-500 w-3.5 h-3.5" />
                    Internal Note (Hidden from client)
                  </label>
                </div>
                <div className="flex gap-2 items-end">
                  <button type="button" className="p-3.5 text-[#8b8175] hover:bg-[#f5f5f0] hover:text-[#2d2a26] rounded-xl transition-colors border border-transparent hover:border-[#e5e0d8]">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isInternal ? "Type an internal note..." : "Type a message..."} 
                    className={`flex-1 px-4 py-3 min-h-[50px] max-h-[150px] resize-none bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:border-[#2d2a26] transition-colors ${isInternal ? 'focus:border-amber-500 bg-amber-50/50' : ''}`}
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
                    className={`p-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center ${
                      isInternal ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-[#2d2a26] hover:bg-black text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {replyMutation.isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#8b8175] bg-[#faf9f7]">
            <div className="w-24 h-24 bg-white shadow-sm border border-[#e5e0d8] rounded-full flex items-center justify-center mb-6">
              <img src="/logo.svg" alt="Logo" className="w-12 h-12 opacity-20 grayscale" onError={(e) => e.target.style.display='none'} />
            </div>
            <h3 className="font-bold text-xl text-[#2d2a26] mb-2">No Ticket Selected</h3>
            <p className="text-sm max-w-xs text-center">Select a ticket from the inbox on the left to view details and respond to the client.</p>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Ticket CRM Details */}
      {selectedTicket && (
        <div className="w-[300px] flex flex-col bg-white rounded-2xl border border-[#e5e0d8] shadow-sm overflow-hidden flex-shrink-0">
          <div className="p-5 border-b border-[#e5e0d8] bg-[#fcfbf9]">
            <h2 className="font-bold text-lg text-[#2d2a26]">Ticket Details</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Client Info */}
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-[#8b8175] mb-3">Client Information</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e5e0d8] flex items-center justify-center text-[#2d2a26] font-bold">
                  {selectedTicket.client?.fullName?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#2d2a26]">{selectedTicket.client?.fullName}</p>
                  <p className="text-xs text-[#8b8175]">{selectedTicket.client?.email}</p>
                </div>
              </div>
            </div>

            {/* Ticket Meta */}
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-[#8b8175] mb-3">Properties</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#8b8175]">Category</span>
                  <span className="text-xs font-semibold text-[#2d2a26]">{selectedTicket.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#8b8175]">Priority</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#8b8175]">Status</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#8b8175]">Created</span>
                  <span className="text-xs font-semibold text-[#2d2a26]">{moment(selectedTicket.createdAt).format('MMM D, YYYY')}</span>
                </div>
              </div>
            </div>

            {/* Assignments */}
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-[#8b8175] mb-3">Assignments</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-[#8b8175] uppercase font-bold block mb-1">Designer</span>
                  <p className="text-sm font-medium text-[#2d2a26]">{selectedTicket.assignedDesigner?.fullName || 'Unassigned'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#8b8175] uppercase font-bold block mb-1">Admin</span>
                  <p className="text-sm font-medium text-[#2d2a26]">{selectedTicket.assignedAdmin?.fullName || 'Unassigned'}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#e5e0d8]">
              <button 
                onClick={() => statusMutation.mutate('Escalated')}
                className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" /> Escalate Ticket
              </button>
            </div>

          </div>
        </div>
      )}

      </div>
    </div>
  );
}
