import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, MapPin, Target, Calendar, MessageSquare, Phone, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const fetchLeadProfile = async (id) => {
  const res = await axios.get(`${API_URL}/leads/${id}`, { withCredentials: true });
  return res.data;
};

export default function LeadProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: queryData, isLoading, isError } = useQuery({
    queryKey: ['admin-lead', id],
    queryFn: () => fetchLeadProfile(id)
  });

  if (isLoading) return <div className="h-full flex items-center justify-center text-[#8b8175]">Loading CRM Profile...</div>;
  if (isError || !queryData?.data) return <div className="h-full flex items-center justify-center text-red-500">Failed to load lead profile.</div>;

  const { lead, activities } = queryData.data;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* Profile Header */}
      <div className="flex items-start gap-6 bg-white p-6 rounded-2xl border border-[#e5e0d8] shadow-sm">
        <button 
          onClick={() => navigate('/admin/leads')}
          className="mt-1 p-2 bg-[#fcfbf9] border border-[#e5e0d8] rounded-full hover:bg-[#e5e0d8] transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-[#2d2a26]" />
        </button>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-nav-style text-3xl font-extrabold text-[#2d2a26]">{lead.name}</h1>
              <p className="text-[#8b8175] text-sm mt-1">{lead.email} • {lead.mobile}</p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-block mb-2 ${
                lead.probabilityScore >= 70 ? 'bg-green-50 text-green-700 border-green-200' : 
                lead.probabilityScore >= 30 ? 'bg-orange-50 text-orange-700 border-orange-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}>
                {lead.probabilityScore}% Conversion Probability
              </span>
              <p className="text-sm font-medium text-[#2d2a26] bg-[#fcfbf9] px-3 py-1 rounded-lg border border-[#e5e0d8]">
                {lead.status}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-[#e5e0d8] pt-6">
            <div>
              <p className="text-xs text-[#8b8175] mb-1">Source</p>
              <div className="text-sm font-medium text-[#2d2a26]">{lead.source}</div>
            </div>
            <div>
              <p className="text-xs text-[#8b8175] mb-1">Location</p>
              <div className="flex items-center gap-1 text-sm text-[#2d2a26]">
                <MapPin className="w-4 h-4 text-[#8b8175]" /> {lead.city || 'Unknown'}
              </div>
            </div>
            <div>
              <p className="text-xs text-[#8b8175] mb-1">Property & Budget</p>
              <div className="text-sm font-medium text-[#2d2a26]">
                {lead.propertyType || 'Unspecified'} (₹{lead.budget?.toLocaleString()})
              </div>
            </div>
            <div>
              <p className="text-xs text-[#8b8175] mb-1">Assigned Executive</p>
              <div className="text-sm font-medium text-[#2d2a26]">
                {lead.assignedToAdmin ? `${lead.assignedToAdmin.firstName} ${lead.assignedToAdmin.lastName}` : 'Unassigned'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Lead Interactions */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-[#e5e0d8] shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#2d2a26]">CRM Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-8 text-[#8b8175] text-sm">No recorded interactions yet.</div>
              ) : (
                <div className="relative border-l-2 border-[#e5e0d8] ml-3 space-y-6">
                  {activities.map((act) => (
                    <div key={act._id} className="relative pl-6">
                      <span className="absolute -left-[11px] top-1 bg-white">
                        {act.type === 'status_change' ? <Target className="w-5 h-5 text-blue-500" /> :
                         act.type === 'call' ? <Phone className="w-5 h-5 text-green-500" /> :
                         <Activity className="w-5 h-5 text-[#8b8175]" />}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-[#2d2a26]">{act.action}</h4>
                        <p className="text-xs text-[#8b8175] mt-1">
                          {new Date(act.createdAt).toLocaleString()} • by {act.user ? `${act.user.firstName} ${act.user.lastName}` : 'System'}
                        </p>
                        {act.details && (
                          <div className="mt-2 bg-[#fcfbf9] p-3 rounded-xl border border-[#e5e0d8] text-sm text-[#2d2a26]">
                            {act.details}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Smart Actions */}
        <div className="space-y-6">
          <Card className="bg-white border-[#e5e0d8] shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#2d2a26]">Lead Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-[#8b8175] mb-1">Preferred Style</p>
                <div className="text-sm font-medium">{lead.preferredStyle || 'Not provided'}</div>
              </div>
              <div>
                <p className="text-xs text-[#8b8175] mb-1">AI Visualizer Usage</p>
                <div className="text-sm font-medium">{lead.aiVisualizerUsage?.generationsCount || 0} generations</div>
              </div>
              {lead.followUpDate && (
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl">
                  <p className="text-xs text-orange-700 font-bold mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Scheduled Follow-up</p>
                  <p className="text-sm text-orange-800">{new Date(lead.followUpDate).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="bg-[#2d2a26] rounded-2xl p-6 text-white text-center">
            <MessageSquare className="w-8 h-8 text-white mx-auto mb-3" />
            <h3 className="font-nav-style font-bold mb-2">Engage Lead</h3>
            <p className="text-sm text-gray-400 mb-4">Send a direct message or schedule a consultation instantly.</p>
            <button className="w-full bg-white text-[#2d2a26] py-2 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors">
              Open Messaging
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
