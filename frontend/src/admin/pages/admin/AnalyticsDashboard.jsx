import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ComposedChart, Line
} from 'recharts';
import { 
  Users, Briefcase, TrendingUp, Filter, Download, Activity, RefreshCw, BarChart2 
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

export default function AnalyticsDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Socket connection for real-time analytics invalidation
    const socket = io(API_URL.replace('/api', ''), { withCredentials: true });
    socket.on('financeUpdated', () => queryClient.invalidateQueries(['analyticsOverview']));
    socket.on('projectUpdated', () => queryClient.invalidateQueries(['analyticsOverview']));
    socket.on('leadUpdated', () => queryClient.invalidateQueries(['analyticsOverview']));
    return () => socket.disconnect();
  }, [queryClient]);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analyticsOverview'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/analytics/overview`, { withCredentials: true });
      return res.data.data;
    }
  });

  if (isLoading || !analytics) return <div className="p-12 flex justify-center"><RefreshCw className="w-8 h-8 text-[#8b8175] animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-nav-style font-extrabold text-[#2d2a26]">Business Intelligence</h1>
          <p className="text-[#8b8175] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Real-time analytics & operational visibility.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e5e0d8] text-[#2d2a26] rounded-lg font-bold hover:bg-[#fcfbf9] transition-colors shadow-sm">
            <Filter className="w-4 h-4" /> Filter Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2d2a26] text-[#fcfbf9] rounded-lg font-bold hover:bg-black transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-[#e5e0d8] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#8b8175] uppercase tracking-wider">Total Revenue</p>
                <p className="text-3xl font-extrabold text-[#2d2a26]">₹{analytics.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e5e0d8] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#8b8175] uppercase tracking-wider">Active Projects</p>
                <p className="text-3xl font-extrabold text-[#2d2a26]">{analytics.activeProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e5e0d8] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#8b8175] uppercase tracking-wider">Total Users</p>
                <p className="text-3xl font-extrabold text-[#2d2a26]">{analytics.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e5e0d8] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#8b8175] uppercase tracking-wider">Total Leads</p>
                <p className="text-3xl font-extrabold text-[#2d2a26]">{analytics.totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[#e5e0d8] mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button
          className={`pb-3 font-bold text-sm tracking-wide ${activeTab === 'overview' ? 'border-b-2 border-[#2d2a26] text-[#2d2a26]' : 'text-[#8b8175] hover:text-[#2d2a26]'}`}
          onClick={() => setActiveTab('overview')}
        >
          REVENUE INTELLIGENCE
        </button>
        <button
          className={`pb-3 font-bold text-sm tracking-wide ${activeTab === 'funnel' ? 'border-b-2 border-[#2d2a26] text-[#2d2a26]' : 'text-[#8b8175] hover:text-[#2d2a26]'}`}
          onClick={() => setActiveTab('funnel')}
        >
          CONVERSION FUNNEL
        </button>
      </div>

      {/* Main Charts Area */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2 bg-white border-[#e5e0d8] shadow-sm">
            <div className="p-6 border-b border-[#e5e0d8] flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#2d2a26]">Monthly Revenue Forecast</h3>
            </div>
            <CardContent className="p-6">
              <div style={{ width: '100%', height: 350 }} className="min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={analytics.revenueByMonth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e0d8" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8b8175'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#8b8175'}} dx={-10} tickFormatter={(value) => `₹${value/1000}k`} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#2d2a26] text-white border-none shadow-sm flex flex-col">
            <div className="p-6 border-b border-gray-700">
              <h3 className="font-bold text-lg flex items-center gap-2"><BarChart2 className="w-5 h-5 text-green-400" /> Executive Summary</h3>
            </div>
            <CardContent className="p-6 flex-1 flex flex-col justify-center space-y-8">
              <div>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Expected Pending Dues</p>
                <p className="text-4xl font-extrabold text-amber-400">₹{analytics.pendingRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-2">To be collected from open invoices</p>
              </div>
              <div className="h-px bg-gray-700"></div>
              <div>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Win Rate</p>
                <p className="text-4xl font-extrabold text-green-400">
                  {analytics.totalLeads > 0 ? Math.round((analytics.activeProjects / analytics.totalLeads) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-400 mt-2">Lead to Project Conversion</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'funnel' && (
        <Card className="bg-white border-[#e5e0d8] shadow-sm">
          <div className="p-6 border-b border-[#e5e0d8]">
            <h3 className="font-bold text-lg text-[#2d2a26]">Client Acquisition Funnel</h3>
          </div>
          <CardContent className="p-6">
            <div style={{ width: '100%', height: 400 }} className="min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <ComposedChart data={analytics.conversionFunnel} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e0d8" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#2d2a26', fontWeight: 'bold'}} />
                  <RechartsTooltip 
                    cursor={{fill: '#f5f5f0'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="value" barSize={40} radius={[0, 4, 4, 0]}>
                    {analytics.conversionFunnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#93c5fd' : index === 1 ? '#60a5fa' : '#3b82f6'} />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
