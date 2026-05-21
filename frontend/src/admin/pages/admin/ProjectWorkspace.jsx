import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, Clock, MapPin, Briefcase } from 'lucide-react';
import MilestoneTracker from '../../components/projects/MilestoneTracker';
import DocumentManager from '../../components/projects/DocumentManager';
import ActivityFeed from '../../components/projects/ActivityFeed';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

const fetchProjectDetails = async (id) => {
  const res = await axios.get(`${API_URL}/projects/${id}`, { withCredentials: true });
  return res.data;
};

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: queryData, isLoading, isError } = useQuery({
    queryKey: ['admin-project', id],
    queryFn: () => fetchProjectDetails(id)
  });

  if (isLoading) return <div className="h-full flex items-center justify-center text-[#8b8175]">Loading Workspace Ecosystem...</div>;
  if (isError || !queryData?.data) return <div className="h-full flex items-center justify-center text-red-500">Failed to load project workspace.</div>;

  const project = queryData.data;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Workspace Header */}
      <div className="flex items-start gap-6 bg-white p-6 rounded-2xl border border-[#e5e0d8] shadow-sm">
        <button 
          onClick={() => navigate('/admin/projects')}
          className="mt-1 p-2 bg-[#fcfbf9] border border-[#e5e0d8] rounded-full hover:bg-[#e5e0d8] transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-[#2d2a26]" />
        </button>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-nav-style text-3xl font-extrabold text-[#2d2a26]">{project.title}</h1>
              <p className="text-[#8b8175] text-sm mt-1">Project ID: {project._id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
              project.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 
              project.status === 'Delayed' ? 'bg-red-50 text-red-700 border-red-200' :
              'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {project.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-[#e5e0d8] pt-6">
            <div>
              <p className="text-xs text-[#8b8175] mb-1">Client</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#e5e0d8] rounded-full flex items-center justify-center overflow-hidden">
                  {project.client?.profileImage ? (
                    <img src={project.client.profileImage} alt="Client" />
                  ) : (
                    <span className="text-xs font-bold">{project.client?.firstName?.charAt(0) || 'C'}</span>
                  )}
                </div>
                <span className="text-sm font-medium text-[#2d2a26]">{project.client ? `${project.client.firstName} ${project.client.lastName}` : 'Unassigned'}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-[#8b8175] mb-1">Lead Designer</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#2d2a26] rounded-full flex items-center justify-center overflow-hidden">
                  <span className="text-xs font-bold text-white">{project.designer?.name?.charAt(0) || 'D'}</span>
                </div>
                <span className="text-sm font-medium text-[#2d2a26]">{project.designer ? project.designer.name : 'Unassigned'}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-[#8b8175] mb-1">Timeline Estimate</p>
              <div className="flex items-center gap-2 text-sm text-[#2d2a26]">
                <Clock className="w-4 h-4 text-[#8b8175]" />
                {project.estimatedCompletion ? new Date(project.estimatedCompletion).toLocaleDateString() : 'TBD'}
              </div>
            </div>
            <div>
              <p className="text-xs text-[#8b8175] mb-1">Budget Allocation</p>
              <div className="text-sm font-bold text-green-600">
                ₹{(project.budget || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Grid 3-Column Ecosystem */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Timeline & Milestones */}
        <div className="lg:col-span-1 space-y-6">
          <MilestoneTracker projectId={project._id} milestones={project.milestones || []} />
        </div>

        {/* Center Col: Documents & Approvals */}
        <div className="lg:col-span-1 space-y-6">
          <DocumentManager projectId={project._id} uploads={project.uploads || []} />
        </div>

        {/* Right Col: Realtime Activity Feed */}
        <div className="lg:col-span-1 space-y-6">
          <ActivityFeed projectId={project._id} />
        </div>

      </div>
    </div>
  );
}
