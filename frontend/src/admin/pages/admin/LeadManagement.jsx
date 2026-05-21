import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Users, TrendingUp, Phone, Calendar, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import LeadPipeline from '../../components/leads/LeadPipeline';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

const fetchLeads = async () => {
  const res = await axios.get(`${API_URL}/leads`, { withCredentials: true, transports: ['websocket', 'polling'] });
  return res.data;
};

export default function LeadManagement() {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const { data: leadsQuery, isLoading } = useQuery({
    queryKey: ['admin-leads'],
    queryFn: fetchLeads,
    refetchInterval: 5000 // Real-time polling fallback if socket disconnects
  });

  const leads = leadsQuery?.data || [];

  const total = leads.length;
  const newLeads = leads.filter(l => l.status === 'New Lead').length;
  const activeFollowups = leads.filter(l => ['Contacted', 'Interested', 'Consultation Scheduled', 'Proposal Sent', 'Negotiation'].includes(l.status)).length;
  const converted = leads.filter(l => l.status === 'Converted').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-nav-style text-3xl font-extrabold text-[#2d2a26]">Lead Ecosystem</h1>
          <p className="font-sans text-[#8b8175]">Real-time sales conversion and pipeline tracking.</p>
        </div>
        <button 
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 bg-[#2d2a26] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1a1816] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Capture Lead
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8b8175]">Total Leads</CardTitle>
            <Users className="w-4 h-4 text-[#2d2a26]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-nav-style font-bold text-[#2d2a26]">{total}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8b8175]">New Opportunities</CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-nav-style font-bold text-blue-600">{newLeads}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8b8175]">Active Pipeline</CardTitle>
            <Phone className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-nav-style font-bold text-orange-600">{activeFollowups}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8b8175]">Converted</CardTitle>
            <Calendar className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-nav-style font-bold text-green-600">{converted}</div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Kanban Pipeline */}
      {isLoading ? (
        <div className="flex justify-center py-12 text-[#8b8175]">Loading CRM Pipeline...</div>
      ) : (
        <LeadPipeline leads={leads} />
      )}
      
    </div>
  );
}
