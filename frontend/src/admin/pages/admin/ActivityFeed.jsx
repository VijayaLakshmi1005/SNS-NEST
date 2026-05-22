import React, { useEffect } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { Activity, Clock, RefreshCw, Zap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

export default function ActivityFeed() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io(API_URL.replace('/api', ''), { withCredentials: true, transports: ['websocket', 'polling'] });
    socket.on('newNotification', () => {
      queryClient.invalidateQueries(['activityFeed']);
    });
    return () => socket.disconnect();
  }, [queryClient]);

  const { data, isLoading } = useQuery({
    queryKey: ['activityFeed'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/live-notifications`, { withCredentials: true, transports: ['websocket', 'polling'] });
      return res.data;
    }
  });

  if (isLoading || !data) return <div className="p-12 flex justify-center"><RefreshCw className="w-8 h-8 text-[#8b8175] animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-[#2d2a26] text-white p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-nav-style font-extrabold flex items-center gap-3">
            <Activity className="w-6 h-6 text-green-400" />
            Live Global Activity Feed
          </h1>
          <p className="text-gray-400 text-sm mt-1">Real-time enterprise event stream</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-xs font-bold text-green-400 uppercase tracking-wider">System Live</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e0d8] shadow-sm p-6">
        <div className="relative border-l-2 border-[#e5e0d8] ml-4 space-y-8">
          {data.data.map((event, index) => (
            <div key={event._id} className="relative pl-8 animate-in slide-in-from-bottom-2 fade-in" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}>
              <div className="absolute -left-2.5 top-1 w-5 h-5 rounded-full bg-white border-4 border-[#2d2a26]"></div>
              
              <div className="bg-[#fcfbf9] border border-[#e5e0d8] p-5 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e5e0d8] text-[#8b8175] px-2 py-1 rounded-md">
                    {event.type}
                  </span>
                  <span className="text-xs text-[#8b8175] flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    {new Date(event.createdAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="font-bold text-[#2d2a26] text-lg mb-1">{event.title}</h3>
                <p className="text-[#8b8175] text-sm">{event.message}</p>
                
                {event.link && (
                  <a href={event.link} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 mt-4 transition-colors">
                    <Zap className="w-3 h-3" /> Take Action
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
