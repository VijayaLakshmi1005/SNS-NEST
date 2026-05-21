import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Users, UserCheck, UserMinus, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import DesignerTable from '../../components/designers/DesignerTable';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

const fetchDesigners = async () => {
  const res = await axios.get(`${API_URL}/designers`, { withCredentials: true, transports: ['websocket', 'polling'] });
  return res.data;
};

const fetchDesignerAnalytics = async () => {
  const res = await axios.get(`${API_URL}/designers/analytics`, { withCredentials: true, transports: ['websocket', 'polling'] });
  return res.data;
};

export default function DesignerManagement() {
  const { data: designersQuery, isLoading: isLoadingDesigners } = useQuery({
    queryKey: ['admin-designers'],
    queryFn: fetchDesigners
  });

  const { data: analyticsQuery } = useQuery({
    queryKey: ['admin-designers-analytics'],
    queryFn: fetchDesignerAnalytics
  });

  const designers = designersQuery?.data || [];
  const analytics = analyticsQuery?.data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="font-nav-style text-3xl font-extrabold text-[#2d2a26]">Designer Ecosystem</h1>
        <p className="font-sans text-[#8b8175]">Manage assignments, monitor workloads, and collaborate with your design team.</p>
      </div>

      {/* Analytics Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8b8175]">Total Designers</CardTitle>
            <Users className="w-4 h-4 text-[#2d2a26]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-nav-style font-bold text-[#2d2a26]">
              {analytics.totalDesigners || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8b8175]">Active & Available</CardTitle>
            <UserCheck className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-nav-style font-bold text-green-600">
              {analytics.activeDesigners || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8b8175]">Currently Busy</CardTitle>
            <UserMinus className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-nav-style font-bold text-orange-500">
              {analytics.busyDesigners || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8b8175]">Consultations Today</CardTitle>
            <CalendarClock className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-nav-style font-bold text-blue-500">
              {analytics.consultationsToday || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Designer Table Ecosystem */}
      <DesignerTable designers={designers} isLoading={isLoadingDesigners} />
    </div>
  );
}
