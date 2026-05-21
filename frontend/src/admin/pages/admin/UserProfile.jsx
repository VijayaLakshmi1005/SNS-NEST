import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserProfile } from '../../hooks/useUserProfile';
import { ArrowLeft, Edit3, Mail, MapPin, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import AdminChatWidget from '../../components/users/AdminChatWidget';
import UserTimeline from '../../components/users/UserTimeline';
import SupportTicketManager from '../../components/users/SupportTicketManager';

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profileQuery, addNoteMutation } = useUserProfile(id);
  const [newNote, setNewNote] = useState('');

  if (profileQuery.isLoading) {
    return <div className="h-full flex items-center justify-center text-[#8b8175]">Loading CRM Profile...</div>;
  }

  if (profileQuery.isError || !profileQuery.data?.data) {
    return <div className="h-full flex items-center justify-center text-red-500">Failed to load profile.</div>;
  }

  const user = profileQuery.data.data;

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addNoteMutation.mutate(newNote, {
      onSuccess: () => setNewNote('')
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/users')}
          className="p-2 bg-white border border-[#e5e0d8] rounded-full hover:bg-[#fcfbf9] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#2d2a26]" />
        </button>
        <div>
          <h1 className="font-nav-style text-3xl font-extrabold text-[#2d2a26]">{user.fullName}</h1>
          <p className="font-sans text-[#8b8175]">Client Profile & Interaction History</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Info & Internal Notes */}
        <div className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
            <CardHeader>
              <CardTitle>Client Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-[#2d2a26]">
                <Mail className="w-4 h-4 text-[#8b8175]" /> {user.email}
              </div>
              <div className="flex items-center gap-3 text-sm text-[#2d2a26]">
                <Phone className="w-4 h-4 text-[#8b8175]" /> {user.mobile}
              </div>
              <div className="flex items-center gap-3 text-sm text-[#2d2a26]">
                <MapPin className="w-4 h-4 text-[#8b8175]" /> Location unverified
              </div>
              <div className="pt-4 border-t border-[#e5e0d8]">
                <p className="text-xs text-[#8b8175] mb-1">Total Lifetime Value</p>
                <p className="text-2xl font-nav-style font-bold text-green-600">₹{user.totalSpent?.toLocaleString() || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#fcfbf9] border-[#e5e0d8] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Internal Admin Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-48 overflow-y-auto space-y-3">
                {user.internalNotes?.map((note, i) => (
                  <div key={i} className="p-3 bg-white border border-[#e5e0d8] rounded-xl text-sm text-[#2d2a26]">
                    <p>{note.note}</p>
                    <p className="text-[10px] text-[#8b8175] mt-2 text-right">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {!user.internalNotes?.length && (
                  <p className="text-xs text-[#8b8175] italic">No internal notes yet.</p>
                )}
              </div>
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add secret note..."
                  className="flex-1 px-3 py-2 text-sm bg-white border border-[#e5e0d8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4cecb]"
                />
                <button type="submit" className="px-3 py-2 bg-[#2d2a26] text-white text-sm rounded-xl hover:bg-[#1a1816]">
                  Save
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column: Chat & Support */}
        <div className="space-y-6">
          <AdminChatWidget userId={id} adminId="admin" />
          
          <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <SupportTicketManager tickets={user.tickets} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Timeline & Projects */}
        <div className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <UserTimeline activities={user.activities} />
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {user.projects?.map(project => (
                <div key={project._id} className="p-3 mb-2 border border-[#e5e0d8] rounded-xl">
                  <h4 className="font-bold text-sm text-[#2d2a26]">{project.title}</h4>
                  <p className="text-xs text-[#8b8175] mt-1 capitalize">Status: {project.status}</p>
                </div>
              ))}
              {!user.projects?.length && (
                <p className="text-xs text-[#8b8175] italic">No active projects.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
