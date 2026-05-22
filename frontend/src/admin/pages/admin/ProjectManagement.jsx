import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Briefcase, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import ProjectTable from '../../components/projects/ProjectTable';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

const fetchProjects = async () => {
  const res = await axios.get(`${API_URL}/projects`, { withCredentials: true, transports: ['websocket', 'polling'] });
  return res.data;
};

export default function ProjectManagement() {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const { data: projectsQuery, isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: fetchProjects
  });

  const projects = projectsQuery?.data || [];

  const total = projects.length;
  const active = projects.filter(p => p.status === 'Execution' || p.status === 'In Design').length;
  const completed = projects.filter(p => p.status === 'Completed').length;
  const delayed = projects.filter(p => p.status === 'Delayed' || p.escalation?.isEscalated).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-nav-style text-3xl font-extrabold text-[#2d2a26]">Project Execution</h1>
          <p className="font-sans text-[#8b8175]">Manage all luxury interior execution lifecycles in real-time.</p>
        </div>
        <button 
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 bg-[#2d2a26] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1a1816] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8b8175]">Total Projects</CardTitle>
            <Briefcase className="w-4 h-4 text-[#2d2a26]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-nav-style font-bold text-[#2d2a26]">{total}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8b8175]">Active Execution</CardTitle>
            <Clock className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-nav-style font-bold text-blue-600">{active}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8b8175]">Completed Handover</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-nav-style font-bold text-green-600">{completed}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8b8175]">Escalations / Delayed</CardTitle>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-nav-style font-bold text-red-600">{delayed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Data Grid */}
      <ProjectTable projects={projects} isLoading={isLoading} />
    </div>
  );
}
