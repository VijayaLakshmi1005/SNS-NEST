import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Users, UserCheck, UserMinus, CalendarClock, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import DesignerTable from '../../components/designers/DesignerTable';
import DesignerFormDialog from '../../components/designers/DesignerFormDialog';
import DesignerProfileDrawer from '../../components/designers/DesignerProfileDrawer';

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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDesigner, setSelectedDesigner] = useState(null);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewDesigner, setViewDesigner] = useState(null);

  const { data: designersQuery, isLoading: isLoadingDesigners, refetch } = useQuery({
    queryKey: ['admin-designers'],
    queryFn: fetchDesigners
  });

  const { data: analyticsQuery } = useQuery({
    queryKey: ['admin-designers-analytics'],
    queryFn: fetchDesignerAnalytics
  });

  const handleDelete = async (id) => {
    try {
      const authStorageStr = localStorage.getItem('auth-storage');
      const token = authStorageStr ? JSON.parse(authStorageStr)?.state?.token : null;
      await axios.delete(`${API_URL}/designers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      refetch();
    } catch (err) {
      console.error(err);
      alert('Failed to delete designer');
    }
  };

  const handleEdit = (designer) => {
    setSelectedDesigner(designer);
    setIsFormOpen(true);
  };

  const handleView = (designer) => {
    setViewDesigner(designer);
    setIsDrawerOpen(true);
  };

  const designers = designersQuery?.data || [];
  const analytics = analyticsQuery?.data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nav-style text-3xl font-extrabold text-[#2d2a26]">Designer Ecosystem</h1>
          <p className="font-sans text-[#8b8175]">Manage assignments, monitor workloads, and collaborate with your design team.</p>
        </div>
        <Button 
          className="gap-2 bg-[#1a1a1a] hover:bg-[#333] text-white"
          onClick={() => { setSelectedDesigner(null); setIsFormOpen(true); }}
        >
          <UserPlus className="w-4 h-4" />
          Add Designer
        </Button>
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
              {analytics.total || 0}
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
              {analytics.active || 0}
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
              {analytics.busy || 0}
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
      <DesignerTable 
        designers={designers} 
        isLoading={isLoadingDesigners} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        onView={handleView}
      />

      {isFormOpen && (
        <DesignerFormDialog 
          isOpen={isFormOpen}
          initialData={selectedDesigner}
          onClose={() => { setIsFormOpen(false); setSelectedDesigner(null); }}
          onSuccess={() => refetch()}
        />
      )}

      <DesignerProfileDrawer 
        designer={viewDesigner}
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setViewDesigner(null); }}
      />
    </div>
  );
}
