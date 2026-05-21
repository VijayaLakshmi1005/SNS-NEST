import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { Bell, Check, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io(API_URL.replace('/api', ''), { withCredentials: true });
    socket.on('newNotification', () => {
      queryClient.invalidateQueries(['notifications']);
    });
    return () => socket.disconnect();
  }, [queryClient]);

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/live-notifications`, { withCredentials: true });
      return res.data;
    },
    refetchInterval: 60000 // Fallback polling every minute just in case
  });

  const markAsRead = useMutation({
    mutationFn: async (id) => {
      await axios.patch(`${API_URL}/live-notifications/${id}/read`, {}, { withCredentials: true });
    },
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await axios.patch(`${API_URL}/live-notifications/read-all`, {}, { withCredentials: true });
    },
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  const notifications = data?.data || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#8b8175] hover:text-[#2d2a26] hover:bg-[#f5f5f0] rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white border border-[#e5e0d8] rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-top-2">
          <div className="p-4 border-b border-[#e5e0d8] bg-[#fcfbf9] flex justify-between items-center">
            <h3 className="font-bold text-[#2d2a26]">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead.mutate()}
                className="text-xs font-bold text-[#8b8175] hover:text-[#2d2a26] flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-[#8b8175] text-sm">No new notifications.</div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif._id} 
                  className={`p-4 border-b border-[#e5e0d8] last:border-0 hover:bg-[#f5f5f0] transition-colors cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-[#fcfbf9]' : ''}`}
                  onClick={() => {
                    if (!notif.isRead) markAsRead.mutate(notif._id);
                    if (notif.link) {
                      navigate(notif.link);
                      setIsOpen(false);
                    }
                  }}
                >
                  {!notif.isRead && <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500 shrink-0"></div>}
                  <div className={notif.isRead ? 'opacity-60' : ''}>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#8b8175] mb-1">{notif.type}</p>
                    <p className="font-bold text-[#2d2a26] text-sm mb-1">{notif.title}</p>
                    <p className="text-xs text-[#8b8175] leading-relaxed">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 border-t border-[#e5e0d8] bg-[#fcfbf9] text-center">
            <button 
              onClick={() => {
                navigate('/admin/notifications');
                setIsOpen(false);
              }}
              className="text-sm font-bold text-[#2d2a26] hover:underline"
            >
              View Activity Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
