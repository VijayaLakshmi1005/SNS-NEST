import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User as UserIcon } from 'lucide-react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

export default function AdminChatWidget({ userId, adminId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const newSocket = io(SOCKET_URL, { auth: { token } });
    setSocket(newSocket);

    newSocket.on('client:receive_message', (data) => {
      // In reality, we'd fetch message history first. For now, we just append live ones.
      setMessages((prev) => [...prev, { ...data, sender: 'admin' }]);
    });

    newSocket.on('admin:receive_message', (data) => {
      if (data.clientId === userId) {
        setMessages((prev) => [...prev, { ...data, sender: 'client' }]);
      }
    });

    return () => newSocket.disconnect();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    const msg = { clientId: userId, message: input, timestamp: new Date(), sender: 'admin' };
    socket.emit('admin:send_message', msg);
    
    // Optimistic UI update
    setMessages((prev) => [...prev, msg]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[500px] bg-[#fcfbf9] rounded-2xl border border-[#e5e0d8] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-white border-b border-[#e5e0d8] flex items-center justify-between">
        <div>
          <h3 className="font-nav-style font-bold text-[#2d2a26]">Direct Message</h3>
          <p className="text-xs text-green-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#8b8175] text-sm italic">
            No active conversation. Send a message to start interacting.
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] p-3 rounded-2xl ${
                  msg.sender === 'admin' 
                    ? 'bg-[#2d2a26] text-[#f5f5f0] rounded-br-sm' 
                    : 'bg-white border border-[#e5e0d8] text-[#2d2a26] rounded-bl-sm'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-[10px] mt-1 text-right ${msg.sender === 'admin' ? 'text-gray-400' : 'text-[#8b8175]'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-white border-t border-[#e5e0d8]">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message to the client..."
            className="flex-1 px-4 py-2 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d4cecb]"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="p-2 bg-[#2d2a26] text-white rounded-xl hover:bg-[#1a1816] transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
