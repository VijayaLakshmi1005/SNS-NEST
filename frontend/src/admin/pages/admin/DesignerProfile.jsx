import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, Star, Briefcase, Mail, Phone, Calendar, Clock, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

// We will build these sub-components next
import AssignedProjects from '../../components/designers/AssignedProjects';
import PerformanceAnalytics from '../../components/designers/PerformanceAnalytics';
import AvailabilityManager from '../../components/designers/AvailabilityManager';
import DesignerUploadSystem from '../../components/designers/DesignerUploadSystem';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

const fetchDesigner = async (id) => {
  const res = await axios.get(`${API_URL}/designers/${id}`, { withCredentials: true, transports: ['websocket', 'polling'] });
  return res.data;
};

export default function DesignerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: queryData, isLoading, isError } = useQuery({
    queryKey: ['admin-designer', id],
    queryFn: () => fetchDesigner(id)
  });

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-[#8b8175]">Loading Designer Profile...</div>;
  }

  if (isError || !queryData?.data) {
    return <div className="h-full flex items-center justify-center text-red-500">Failed to load designer.</div>;
  }

  const designer = queryData.data;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header Profile Section */}
      <div className="flex items-start gap-6 bg-white p-6 rounded-2xl border border-[#e5e0d8] shadow-sm">
        <button 
          onClick={() => navigate('/admin/designers')}
          className="mt-1 p-2 bg-[#fcfbf9] border border-[#e5e0d8] rounded-full hover:bg-[#e5e0d8] transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-[#2d2a26]" />
        </button>
        
        <div className="w-24 h-24 rounded-full bg-[#e5e0d8] flex items-center justify-center overflow-hidden shrink-0">
          {designer.profileImage ? (
            <img src={designer.profileImage} alt={designer.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[#2d2a26] text-3xl font-bold font-nav-style">{designer.name.charAt(0)}</span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-nav-style text-3xl font-extrabold text-[#2d2a26]">{designer.name}</h1>
              <p className="text-[#8b8175] text-sm mt-1">{designer.specialization} • {designer.experience} Years Exp</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
              designer.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
              designer.status === 'Busy' ? 'bg-orange-50 text-orange-700 border-orange-200' :
              'bg-gray-50 text-gray-700 border-gray-200'
            }`}>
              {designer.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-[#2d2a26]">
              <Mail className="w-4 h-4 text-[#8b8175]" /> {designer.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-[#2d2a26]">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {designer.rating} / 5.0
            </div>
            <div className="flex items-center gap-2 text-sm text-[#2d2a26]">
              <Briefcase className="w-4 h-4 text-[#8b8175]" /> {designer.completedProjects || 0} Completed
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
              ₹{(designer.totalEarnings || 0).toLocaleString()} Earned
            </div>
          </div>
        </div>
      </div>

      {/* 360 Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
            <CardHeader>
              <CardTitle>Biography</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#8b8175] leading-relaxed">{designer.bio}</p>
            </CardContent>
          </Card>

          <PerformanceAnalytics designer={designer} />
          
          <AvailabilityManager designerId={designer._id} initialAvailability={designer.availability} />
        </div>

        {/* Right Column (Wider) */}
        <div className="space-y-6 lg:col-span-2">
          <AssignedProjects projects={designer.activeProjects} />
          <DesignerUploadSystem designerId={designer._id} />
        </div>

      </div>
    </div>
  );
}
