import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { Filter, Download, RefreshCw, FileText, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import ExecutiveKPIs from '../../components/analytics/ExecutiveKPIs';
import RevenueCharts from '../../components/analytics/RevenueCharts';
import LeadFunnel from '../../components/analytics/LeadFunnel';
import DesignerLeaderboard from '../../components/analytics/DesignerLeaderboard';
import RealtimeActivityFeed from '../../components/analytics/RealtimeActivityFeed';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

export default function AnalyticsDashboard() {
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    // Listen for realtime system-wide events and invalidate analytics
    const socket = io(API_URL.replace('/api', ''), { withCredentials: true, transports: ['websocket', 'polling'] });
    const events = ['analytics:update', 'financeUpdated', 'projectUpdated', 'leadUpdated', 'payment:success', 'activity:new'];
    
    events.forEach(event => {
      socket.on(event, () => {
        // Debounce or directly invalidate specific query keys
        queryClient.invalidateQueries(['analyticsDashboard']);
        queryClient.invalidateQueries(['analyticsRevenue']);
        queryClient.invalidateQueries(['analyticsLeads']);
        queryClient.invalidateQueries(['analyticsDesigners']);
        queryClient.invalidateQueries(['analyticsActivity']);
      });
    });
    
    return () => socket.disconnect();
  }, [queryClient]);

  // Fetch all separated endpoints
  const { data: kpis, isLoading: isLoadingKPIs } = useQuery({ queryKey: ['analyticsDashboard'], queryFn: async () => (await axios.get(`${API_URL}/analytics/dashboard`, { withCredentials: true })).data.data });
  const { data: revenue, isLoading: isLoadingRevenue } = useQuery({ queryKey: ['analyticsRevenue'], queryFn: async () => (await axios.get(`${API_URL}/analytics/revenue`, { withCredentials: true })).data.data });
  const { data: leads, isLoading: isLoadingLeads } = useQuery({ queryKey: ['analyticsLeads'], queryFn: async () => (await axios.get(`${API_URL}/analytics/leads`, { withCredentials: true })).data.data });
  const { data: designers, isLoading: isLoadingDesigners } = useQuery({ queryKey: ['analyticsDesigners'], queryFn: async () => (await axios.get(`${API_URL}/analytics/designers`, { withCredentials: true })).data.data });
  const { data: activity, isLoading: isLoadingActivity } = useQuery({ queryKey: ['analyticsActivity'], queryFn: async () => (await axios.get(`${API_URL}/analytics/activity`, { withCredentials: true })).data.data });

  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      if (!kpis) return;
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Metric,Value\n"
        + `Total Revenue,${kpis.revenue.total}\n`
        + `Active Projects,${kpis.projects.active}\n`
        + `Total Leads,${kpis.leads.total}\n`
        + `Converted Leads,${kpis.leads.converted}\n`
        + `Active Clients,${kpis.users.activeClients}\n`
        + `Designers,${kpis.users.designers}\n`;

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `SNS_NEST_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export Error:", error);
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const handleExportPDF = () => {
    window.print(); // Natively trigger print-to-pdf for crash-free reliability
    setShowExportMenu(false);
  };

  if (isLoadingKPIs || isLoadingRevenue) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 text-[#8b8175] animate-spin" />
        <p className="text-[#8b8175] font-bold font-nav-style tracking-wider">Syncing BI Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 font-nav-style">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2d2a26]">Business Intelligence</h1>
          <p className="text-[#8b8175] flex items-center gap-2 mt-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            Real-time analytics & enterprise reporting.
          </p>
        </div>
        
        <div className="flex items-center gap-3 relative">
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2d2a26] text-white rounded-xl font-bold hover:bg-black transition-all shadow-md active:scale-95"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export Report
            </button>
            <AnimatePresence>
              {showExportMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-[#e5e0d8] w-48 overflow-hidden z-50"
                >
                  <button onClick={handleExportPDF} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#2d2a26] hover:bg-[#f5f4f0] transition-colors border-b border-[#e5e0d8]">
                    <FileText className="w-4 h-4 text-red-500" /> Save as PDF
                  </button>
                  <button onClick={handleExportCSV} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#2d2a26] hover:bg-[#f5f4f0] transition-colors">
                    <FileSpreadsheet className="w-4 h-4 text-green-600" /> Export to CSV
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Dynamic Executive KPI Cards */}
      <ExecutiveKPIs data={kpis} />

      {/* Main Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:break-inside-avoid">
        {/* Revenue Growth - Spans 8 columns on large screens */}
        <div className="lg:col-span-8">
          <RevenueCharts data={revenue} />
        </div>
        
        {/* Lead Funnel - Spans 4 columns */}
        <div className="lg:col-span-4">
          <LeadFunnel data={leads} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:break-inside-avoid">
        {/* Designer Leaderboard */}
        <div className="lg:col-span-6">
          <DesignerLeaderboard data={designers} />
        </div>
        
        {/* Real-time Activity Feed */}
        <div className="lg:col-span-6">
          <RealtimeActivityFeed data={activity} />
        </div>
      </div>
    </div>
  );
}
