import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { MoreHorizontal, Search, UserPlus, Users as UsersIcon, UserCheck, UserX, ShieldBan, ExternalLink, PenTool, Trash2 } from 'lucide-react';
import CountUp from 'react-countup';
import api from '../../../client/utils/api';
import moment from 'moment';
import UserModal from '../../components/users/UserModal';
import UserProfileDrawer from '../../components/users/UserProfileDrawer';
import { io } from 'socket.io-client';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [kpis, setKpis] = useState({ totalUsers: 0, activeUsers: 0, verifiedUsers: 0, blockedUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [fullProfile, setFullProfile] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, kpiRes] = await Promise.all([
        api.get('/admin/users', { params: { search, limit: 100 } }),
        api.get('/admin/users/kpis')
      ]);
      setUsers(usersRes.data.data.users);
      setKpis(kpiRes.data.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Setup Socket.io
    let token = '';
    try {
      const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      token = authData?.state?.token || '';
    } catch (e) {}

    const backendUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');
    const socket = io(backendUrl, { auth: { token } });
    socket.on('user:created', fetchUsers);
    socket.on('user:updated', fetchUsers);
    socket.on('user:deleted', fetchUsers);
    socket.on('user:blocked', fetchUsers);
    socket.on('user:unblocked', fetchUsers);
    socket.on('user:verified', fetchUsers);

    return () => socket.disconnect();
  }, [search]);

  const handleOpenProfile = async (user) => {
    try {
      const res = await api.get(`/admin/users/${user._id}`);
      setFullProfile(res.data.data);
      setIsDrawerOpen(true);
    } catch (err) {
      console.error("Failed to fetch full profile", err);
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,\ufeff" 
      + "Name,Email,Mobile,Role,Status,Joined\n"
      + users.map(u => `"${u.fullName}","${u.email}","=""${u.mobile}""","${u.role}","${u.clientStatus}","${moment(u.createdAt).format('YYYY-MM-DD')}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "user_management_export.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleSendMessage = (user) => {
    window.location.href = `mailto:${user.email}?subject=Regarding Your SNS NEST Profile`;
  };

  const handleBookConsultation = async (user) => {
    const time = window.prompt(`Book a consultation for ${user.fullName}.\nEnter date/time (e.g. Next Monday 10:00 AM):`);
    if (time) {
      try {
        await api.post(`/admin/users/${user._id}/notes`, { note: `Consultation Booked for: ${time}` });
        alert(`Consultation booked successfully for ${time}! Recorded in CRM notes.`);
        fetchUsers();
      } catch (err) {
        alert("Failed to book consultation");
      }
    }
  };

  const handleResetPassword = async (user) => {
    const newPass = window.prompt(`Enter new password for ${user.fullName} (minimum 6 characters):`);
    if (newPass && newPass.length >= 6) {
      try {
        await api.patch(`/admin/users/${user._id}`, { password: newPass });
        alert(`Password for ${user.fullName} successfully updated!`);
      } catch (err) {
        alert("Failed to reset password");
      }
    } else if (newPass) {
      alert("Password must be at least 6 characters.");
    }
  };

  const handleSaveUser = async (data) => {
    try {
      if (selectedUser) {
        await api.patch(`/admin/users/${selectedUser._id}`, data);
      } else {
        await api.post('/admin/users', data);
      }
      setIsModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Failed to save user", err);
      alert(err.response?.data?.message || 'Error saving user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to archive this user?")) {
      try {
        await api.delete(`/admin/users/${id}`);
        fetchUsers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleBlockToggle = async (id, currentStatus) => {
    const reason = prompt(`Enter reason to ${currentStatus ? 'unblock' : 'block'} user:`, 'Admin action');
    if (reason !== null) {
      try {
        await api.patch(`/admin/users/${id}/block`, { reason });
        fetchUsers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const kpiCards = [
    { title: 'Total Users', value: kpis.totalUsers, icon: UsersIcon },
    { title: 'Active (30d)', value: kpis.activeUsers, icon: UserCheck },
    { title: 'Verified', value: kpis.verifiedUsers, icon: UserCheck, color: 'text-green-600' },
    { title: 'Blocked', value: kpis.blockedUsers, icon: ShieldBan, color: 'text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-[#1a1a1a]">Client CRM</h1>
          <p className="text-[#8b8175] mt-1 text-sm uppercase tracking-widest font-semibold">Enterprise User Management</p>
        </div>
        <Button onClick={() => { setSelectedUser(null); setIsModalOpen(true); }} className="gap-2 shadow-lg hover:shadow-xl transition-all">
          <UserPlus className="w-4 h-4" />
          Add Client
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-[#e6e6df]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#8b8175] uppercase tracking-wider mb-2">{kpi.title}</p>
                      <h3 className={`text-3xl font-bold font-playfair ${kpi.color || 'text-[#1a1a1a]'}`}>
                        <CountUp end={kpi.value} duration={2} separator="," />
                      </h3>
                    </div>
                    <div className="w-12 h-12 bg-[#f5f5f0] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-[#1a1a1a]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Table Card */}
      <Card className="border-[#e6e6df] shadow-lg">
        <div className="p-4 border-b border-[#e6e6df] flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50">
          <h2 className="font-playfair font-bold text-xl text-[#1a1a1a]">User Directory</h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8175]" />
            <Input 
              className="pl-9 border-[#e6e6df] bg-white rounded-xl" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e6e6df] bg-[#fbfbf9]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#8b8175]">Client</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#8b8175]">Contact</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#8b8175]">Status & Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#8b8175]">Projects</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#8b8175]">Designer</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#8b8175] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-[#8b8175] animate-pulse">Loading CRM data...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-[#8b8175]">No users found.</td></tr>
              ) : (
                users.map((user, idx) => (
                  <motion.tr 
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-[#e6e6df] hover:bg-[#fbfbf9]/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E3D5CA] flex items-center justify-center font-playfair font-bold text-[#1a1a1a]">
                          {user.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#1a1a1a] group-hover:text-amber-700 transition-colors cursor-pointer" onClick={() => handleOpenProfile(user)}>
                            {user.fullName}
                          </p>
                          <p className="text-xs text-[#8b8175] uppercase tracking-wider mt-0.5">Joined {moment(user.createdAt).format('MMM D, YYYY')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#1a1a1a]">{user.email}</p>
                      <p className="text-sm text-[#8b8175]">{user.mobile}</p>
                    </td>
                    <td className="px-6 py-4 space-y-1.5">
                      <div className="flex gap-1.5">
                        {user.isVerified ? (
                          <Badge variant="success" className="text-[9px] h-5"><Shield className="w-2.5 h-2.5 mr-1"/> Verified</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[9px] h-5">Unverified</Badge>
                        )}
                        {user.isBlocked && <Badge variant="destructive" className="text-[9px] h-5"><ShieldBan className="w-2.5 h-2.5 mr-1"/> Blocked</Badge>}
                      </div>
                      {user.role === 'client' ? (
                        <p className="text-[10px] text-[#1a1a1a] font-bold uppercase tracking-wider">{user.clientStatus}</p>
                      ) : (
                        <p className="text-[10px] text-[#8b8175] font-semibold uppercase tracking-wider italic">Internal Staff</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'client' ? (
                        user.assignedDesignerName ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-[10px] font-bold">
                              {user.assignedDesignerName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-[#1a1a1a]">{user.assignedDesignerName}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-[#8b8175] italic bg-[#f5f5f0] px-2 py-1 rounded-md">Unassigned</span>
                        )
                      ) : (
                        <span className="text-xs font-semibold text-[#8b8175] italic">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenProfile(user)} title="View Profile">
                          <ExternalLink className="w-4 h-4 text-[#8b8175] hover:text-[#1a1a1a]" />
                        </Button>
                        <button onClick={() => handleSendMessage(user)} className="px-4 py-2 text-left text-sm hover:bg-[#f5f5f0] text-[#1a1a1a] transition-colors">Send Message</button>
                        <button onClick={() => handleBookConsultation(user)} className="px-4 py-2 text-left text-sm hover:bg-[#f5f5f0] text-[#1a1a1a] transition-colors">Book Consultation</button>
                        <button onClick={() => handleResetPassword(user)} className="px-4 py-2 text-left text-sm hover:bg-[#f5f5f0] text-[#1a1a1a] transition-colors">Reset Password</button>
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedUser(user); setIsModalOpen(true); }} title="Edit User">
                          <PenTool className="w-4 h-4 text-[#8b8175] hover:text-[#1a1a1a]" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleBlockToggle(user._id, user.isBlocked)} title={user.isBlocked ? 'Unblock' : 'Block'}>
                          <ShieldBan className={`w-4 h-4 ${user.isBlocked ? 'text-red-500' : 'text-[#8b8175] hover:text-[#1a1a1a]'}`} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(user._id)} title="Archive">
                          <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        user={selectedUser} 
        onSave={handleSaveUser} 
      />

      <UserProfileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        profile={fullProfile}
      />
    </div>
  );
}
