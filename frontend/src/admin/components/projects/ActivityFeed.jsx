import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Activity, MessageSquare, Zap } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://sns-nest-backend.onrender.com');

export default function ActivityFeed({ projectId }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch initial activities
    const fetchActivities = async () => {
      try {
        const res = await axios.get(`${API_URL}/projects/${projectId}/activity`, { withCredentials: true });
        if (res.data?.data) {
          setActivities(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch activity feed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivities();

    // 2. Setup Real-time WebSockets
    const socket = io(SOCKET_URL, { withCredentials: true });
    
    socket.on('connect', () => {
      socket.emit('joinProjectRoom', projectId);
    });

    socket.on('newActivity', (activity) => {
      setActivities((prev) => [activity, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId]);

  return (
    <Card className="bg-[#2d2a26] text-white shadow-xl h-full flex flex-col">
      <CardHeader className="border-b border-gray-700 pb-4">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" /> Live Execution Feed
          </div>
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full animate-pulse">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Connected
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto pt-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-400 text-sm py-8">Syncing feed...</div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Activity className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No recent activity.</p>
          </div>
        ) : (
          <div className="relative border-l border-gray-700 ml-2 space-y-6">
            {activities.map((act, i) => (
              <div key={act._id || i} className="relative pl-5">
                <div className="absolute -left-[5px] top-1 w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)]"></div>
                
                <p className="text-xs text-gray-400">
                  {new Date(act.createdAt).toLocaleString()}
                </p>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mt-1">
                  <h4 className="font-bold text-sm text-gray-100">{act.action}</h4>
                  <p className="text-xs text-gray-400 mt-1">{act.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
