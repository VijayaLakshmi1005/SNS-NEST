import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { Send, Paperclip, MoreVertical, Search, CheckCircle, AlertTriangle, Clock, RefreshCw, User } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function SupportOverview() {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const socket = io('http://localhost:5000', { withCredentials: true });
    socket.on('supportUpdated', (data) => {
      queryClient.invalidateQueries(['supportTickets']);
      if (data.ticketId === selectedTicket?._id) {
        queryClient.invalidateQueries(['supportMessages', selectedTicket._id]);
      }
    });
    return () => socket.disconnect();
  }, [queryClient, selectedTicket]);

  const { data: tickets, isLoading: loadingTickets } = useQuery({
    queryKey: ['supportTickets'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/support-tickets/tickets`, { withCredentials: true });
      return res.data.data;
    }
  });

  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['supportMessages', selectedTicket?._id],
    queryFn: async () => {
      if (!selectedTicket) return [];
      const res = await axios.get(`${API_URL}/support-tickets/tickets/${selectedTicket._id}/messages`, { withCredentials: true });
      return res.data.data;
    },
    enabled: !!selectedTicket
  });

  const replyMutation = useMutation({
    mutationFn: async (payload) => {
      await axios.post(`${API_URL}/support-tickets/tickets/${selectedTicket._id}/reply`, payload, { withCredentials: true });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries(['supportMessages', selectedTicket._id]);
    }
  });

  const statusMutation = useMutation({
    mutationFn: async (status) => {
      await axios.patch(`${API_URL}/support-tickets/tickets/${selectedTicket._id}/status`, { status }, { withCredentials: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['supportTickets']);
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

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Urgent': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-blue-500 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  if (loadingTickets || !tickets) return <div className="p-12 flex justify-center"><RefreshCw className="w-8 h-8 text-[#8b8175] animate-spin" /></div>;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500 pb-6">
      {/* Left Panel: Ticket List */}
      <div className="w-full md:w-1/3 flex flex-col bg-white rounded-2xl border border-[#e5e0d8] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#e5e0d8] bg-[#fcfbf9]">
          <h2 className="font-bold text-lg text-[#2d2a26] mb-4">Support Inbox</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#8b8175]" />
            <input 
              type="text" 
              placeholder="Search tickets..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:border-[#2d2a26] transition-colors"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {tickets.map(ticket => (
            <div 
              key={ticket._id}
              onClick={() => setSelectedTicket(ticket)}
              className={`p-4 border-b border-[#e5e0d8] cursor-pointer transition-colors ${selectedTicket?._id === ticket._id ? 'bg-[#f5f5f0]' : 'hover:bg-[#fcfbf9]'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[#8b8175]">{ticket.ticketNumber}</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </div>
              <h3 className="font-bold text-[#2d2a26] text-sm mb-1 truncate">{ticket.subject}</h3>
              <p className="text-xs text-[#8b8175] truncate mb-2">{ticket.clientName}</p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8b8175] bg-[#e5e0d8] px-2 py-1 rounded-md">{ticket.status}</span>
                <span className="text-gray-400">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Chat Interface */}
      <div className="w-full md:w-2/3 flex flex-col bg-white rounded-2xl border border-[#e5e0d8] shadow-sm overflow-hidden relative">
        {selectedTicket ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-[#e5e0d8] bg-[#fcfbf9] flex justify-between items-center">
              <div>
                <h2 className="font-bold text-xl text-[#2d2a26]">{selectedTicket.subject}</h2>
                <p className="text-sm text-[#8b8175]">Reported by <span className="font-semibold text-[#2d2a26]">{selectedTicket.clientName}</span> • {selectedTicket.category}</p>
              </div>
              <div className="flex gap-2">
                {selectedTicket.status !== 'Resolved' && (
                  <button 
                    onClick={() => statusMutation.mutate('Resolved')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Resolve
                  </button>
                )}
                {selectedTicket.status !== 'Escalated' && (
                  <button 
                    onClick={() => statusMutation.mutate('Escalated')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4" /> Escalate
                  </button>
                )}
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#faf9f7] space-y-4">
              {loadingMessages ? (
                <div className="flex justify-center"><RefreshCw className="w-6 h-6 text-[#8b8175] animate-spin" /></div>
              ) : (
                messages?.map((msg, index) => {
                  const isAdmin = msg.senderRole === 'admin' || msg.senderRole === 'support';
                  return (
                    <div key={index} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm relative ${
                        msg.isInternalNote ? 'bg-amber-100 border border-amber-200 text-amber-900 rounded-tr-none' : 
                        isAdmin ? 'bg-[#2d2a26] text-white rounded-tr-none' : 'bg-white border border-[#e5e0d8] text-[#2d2a26] rounded-tl-none'
                      }`}>
                        {msg.isInternalNote && <span className="absolute -top-3 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">INTERNAL NOTE</span>}
                        <p className="text-sm font-bold mb-1 opacity-70">{msg.senderName}</p>
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                        <p className="text-[10px] mt-2 opacity-50 text-right">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Area */}
            <div className="p-4 bg-white border-t border-[#e5e0d8]">
              <form onSubmit={handleSend} className="flex flex-col gap-3">
                <div className="flex items-center gap-4 px-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-[#8b8175] cursor-pointer">
                    <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="accent-amber-500 w-4 h-4" />
                    Internal Note (Hidden from client)
                  </label>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="p-3 text-[#8b8175] hover:bg-[#f5f5f0] rounded-xl transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..." 
                    className={`flex-1 px-4 py-3 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:border-[#2d2a26] transition-colors ${isInternal ? 'focus:border-amber-500 bg-amber-50' : ''}`}
                  />
                  <button 
                    type="submit"
                    disabled={!message.trim() || replyMutation.isPending}
                    className="p-3 bg-[#2d2a26] text-white rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {replyMutation.isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#8b8175]">
            <div className="w-20 h-20 bg-[#f5f5f0] rounded-full flex items-center justify-center mb-4">
              <Clock className="w-10 h-10 text-[#d0c9bd]" />
            </div>
            <h3 className="font-bold text-lg text-[#2d2a26]">No Ticket Selected</h3>
            <p className="text-sm">Select a ticket from the inbox to start resolving.</p>
          </div>
        )}
      </div>
    </div>
  );
}
