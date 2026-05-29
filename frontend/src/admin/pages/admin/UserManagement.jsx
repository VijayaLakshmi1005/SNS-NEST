import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, Download, RefreshCw, Users, UserCheck, ShieldBan, MoreHorizontal, MessageSquare, Lock, PenTool, Trash2, Shield, Calendar, IndianRupee } from 'lucide-react';
import CountUp from 'react-countup';
import api from '../../../client/utils/api';
import moment from 'moment';
import UserModal from '../../components/users/UserModal';
import UserProfileDrawer from '../../components/users/UserProfileDrawer';
import { io } from 'socket.io-client';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [kpis, setKpis] = useState({ totalUsers: 0, activeUsers: 0, verifiedUsers: 0, blockedUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [fullProfile, setFullProfile] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  const fetchUsers = async (showSync = false) => {
    try {
      if (showSync) setSyncing(true);
      const statusParam = activeTab !== 'all' ? activeTab : '';
      const [usersRes, kpiRes] = await Promise.all([
        api.get('/admin/users', { params: { search, limit: 100, status: statusParam } }),
        api.get('/admin/users/kpis')
      ]);
      setUsers(usersRes.data.data.users);
      setKpis(kpiRes.data.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
      setTimeout(() => setSyncing(false), 500);
    }
  };

  useEffect(() => {
    fetchUsers(true);

    let token = '';
    try {
      const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      token = authData?.state?.token || '';
    } catch (e) {}

    const backendUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');
    const socket = io(backendUrl, { auth: { token } });
    socket.on('user:created', () => fetchUsers(true));
    socket.on('user:updated', () => fetchUsers(true));
    socket.on('user:deleted', () => fetchUsers(true));
    socket.on('user:blocked', () => fetchUsers(true));
    socket.on('user:unblocked', () => fetchUsers(true));
    socket.on('user:verified', () => fetchUsers(true));

    return () => socket.disconnect();
  }, [search, activeTab]);

  const handleOpenProfile = async (user) => {
    try {
      const res = await api.get(`/admin/users/${user._id}`);
      setFullProfile(res.data.data);
      setIsDrawerOpen(true);
      setActionMenuOpen(null);
    } catch (err) {
      console.error("Failed to fetch full profile", err);
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
      fetchUsers(true);
    } catch (err) {
      console.error("Failed to save user", err);
      alert(err.response?.data?.message || 'Error saving user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Archive this user? This cannot be undone from the UI.")) {
      try {
        await api.delete(`/admin/users/${id}`);
        fetchUsers(true);
        setActionMenuOpen(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleBlockToggle = async (id, currentStatus) => {
    const reason = prompt(`Enter reason to ${currentStatus ? 'unblock' : 'block'} user:`, 'Admin review required');
    if (reason !== null) {
      try {
        await api.patch(`/admin/users/${id}/block`, { reason });
        fetchUsers(true);
        setActionMenuOpen(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleVerify = async (id) => {
    if (window.confirm("Manually verify this user?")) {
      try {
        await api.patch(`/admin/users/${id}/verify`);
        fetchUsers(true);
        setActionMenuOpen(null);
      } catch (err) {
        console.error(err);
      }
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
    setActionMenuOpen(null);
  };

  const handleBookConsultation = async (user) => {
    const time = window.prompt(`Book a consultation for ${user.fullName}.\nEnter date/time (e.g. Next Monday 10:00 AM):`);
    if (time) {
      try {
        await api.post(`/admin/users/${user._id}/notes`, { note: `Consultation Booked for: ${time}` });
        alert(`Consultation booked successfully for ${time}! Recorded in CRM notes.`);
        fetchUsers(true);
      } catch (err) {
        alert("Failed to book consultation");
      }
    }
    setActionMenuOpen(null);
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
    setActionMenuOpen(null);
  };

  const kpiCards = [
    { title: 'Total Registered', value: kpis.totalUsers, icon: Users, color: 'text-[#1a1a1a]' },
    { title: 'Active Accounts', value: kpis.activeUsers, icon: UserCheck, color: 'text-green-600' },
    { title: 'Verified Profiles', value: kpis.verifiedUsers, icon: Shield, color: 'text-blue-600' },
    { title: 'Restricted/Blocked', value: kpis.blockedUsers, icon: ShieldBan, color: 'text-red-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-[#1a1a1a] flex items-center gap-3">
            User Command Center
            <span className={`w-2.5 h-2.5 rounded-full ${syncing ? 'bg-green-500 animate-pulse' : 'bg-green-500'} shadow-[0_0_8px_rgba(34,197,94,0.6)]`} title="Live Sync Active" />
          </h1>
          <p className="text-[#8b8175] mt-1 text-sm">Manage clients, designers, and access permissions in realtime.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-[#e6e6df] bg-white hover:bg-[#f5f5f0]" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button onClick={() => { setSelectedUser(null); setIsModalOpen(true); }} className="gap-2 shadow-lg hover:shadow-xl transition-all">
            <Users className="w-4 h-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, type: "spring" }}
            >
              <Card className="overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-[#e6e6df] bg-gradient-to-br from-white to-[#fbfbf9]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-[#8b8175] uppercase tracking-widest mb-2">{kpi.title}</p>
                      <h3 className={`text-3xl font-bold font-playfair ${kpi.color}`}>
                        <CountUp end={kpi.value} duration={2} separator="," />
                      </h3>
                    </div>
                    <div className="w-12 h-12 bg-[#E3D5CA]/30 rounded-full flex items-center justify-center group-hover:bg-[#E3D5CA] transition-colors">
                      <Icon className={`w-5 h-5 ${kpi.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Table Card */}
      <Card className="border-[#e6e6df] shadow-lg bg-white overflow-hidden rounded-xl">
        <div className="p-4 border-b border-[#e6e6df] flex flex-col md:flex-row items-center justify-between gap-4 bg-[#fbfbf9]">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {['all', 'verified', 'unverified', 'blocked'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                  activeTab === tab ? 'bg-[#1a1a1a] text-white' : 'bg-white border border-[#e6e6df] text-[#8b8175] hover:border-[#1a1a1a]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8175]" />
            <Input 
              className="pl-9 border-[#e6e6df] bg-white rounded-full focus:ring-1 focus:ring-[#1a1a1a] transition-shadow" 
              placeholder="Search by name, email, or mobile..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e6e6df] bg-white">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8b8175]">Profile Details</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8b8175]">Contact Data</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8b8175]">CRM Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8b8175]">Designer assigned</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8b8175] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-[#8b8175]">
                      <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                      <p className="font-playfair italic">Syncing Enterprise Data...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-[#8b8175] font-medium">No users match your criteria.</td></tr>
              ) : (
                users.map((user, idx) => (
                  <motion.tr 
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-[#e6e6df]/50 hover:bg-[#fbfbf9] transition-colors group relative"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E3D5CA]/50 flex items-center justify-center font-playfair font-bold text-[#1a1a1a] shadow-sm">
                          {user.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#1a1a1a] hover:text-[#D5BDAF] transition-colors cursor-pointer" onClick={() => handleOpenProfile(user)}>
                            {user.fullName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 capitalize border-[#D5BDAF] text-[#8b8175]">{user.role}</Badge>
                            <span className="text-[10px] text-[#8b8175] uppercase tracking-wider">{moment(user.createdAt).format('MMM YYYY')}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#1a1a1a] truncate max-w-[150px]" title={user.email}>{user.email}</p>
                      <p className="text-xs text-[#8b8175] mt-1 font-mono">{user.mobile}</p>
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
                      <div className="relative inline-block">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setActionMenuOpen(actionMenuOpen === user._id ? null : user._id)}
                          className="hover:bg-[#E3D5CA]/30 text-[#1a1a1a] rounded-full"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                        
                        <AnimatePresence>
                          {actionMenuOpen === user._id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 10 }}
                              className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#e6e6df] rounded-xl shadow-2xl z-50 overflow-hidden"
                            >
                              <div className="py-1 flex flex-col">
                                <button onClick={() => handleOpenProfile(user)} className="px-4 py-2 text-left text-sm text-[#1a1a1a] hover:bg-[#f5f5f0] flex items-center gap-2 transition-colors">
                                  <Users className="w-3.5 h-3.5 text-[#8b8175]" /> View CRM Profile
                                </button>
                                <button onClick={() => { setSelectedUser(user); setIsModalOpen(true); setActionMenuOpen(null); }} className="px-4 py-2 text-left text-sm text-[#1a1a1a] hover:bg-[#f5f5f0] flex items-center gap-2 transition-colors">
                                  <PenTool className="w-3.5 h-3.5 text-[#8b8175]" /> Edit Details
                                </button>
                                {!user.isVerified && (
                                  <button onClick={() => handleVerify(user._id)} className="px-4 py-2 text-left text-sm text-[#1a1a1a] hover:bg-[#f5f5f0] flex items-center gap-2 transition-colors">
                                    <Shield className="w-3.5 h-3.5 text-blue-500" /> Verify Account
                                  </button>
                                )}
                                <div className="h-px bg-[#e6e6df] my-1" />
                                <button onClick={() => handleSendMessage(user)} className="px-4 py-2 text-left text-sm text-[#1a1a1a] hover:bg-[#f5f5f0] flex items-center gap-2 transition-colors">
                                  <MessageSquare className="w-3.5 h-3.5 text-[#8b8175]" /> Send Message
                                </button>
                                <button onClick={() => handleBookConsultation(user)} className="px-4 py-2 text-left text-sm text-[#1a1a1a] hover:bg-[#f5f5f0] flex items-center gap-2 transition-colors">
                                  <Calendar className="w-3.5 h-3.5 text-[#8b8175]" /> Book Consultation
                                </button>
                                <button onClick={() => handleResetPassword(user)} className="px-4 py-2 text-left text-sm text-[#1a1a1a] hover:bg-[#f5f5f0] flex items-center gap-2 transition-colors">
                                  <Lock className="w-3.5 h-3.5 text-[#8b8175]" /> Reset Password
                                </button>
                                <div className="h-px bg-[#e6e6df] my-1" />
                                <button onClick={() => handleBlockToggle(user._id, user.isBlocked)} className="px-4 py-2 text-left text-sm text-[#1a1a1a] hover:bg-red-50 flex items-center gap-2 transition-colors">
                                  <ShieldBan className={`w-3.5 h-3.5 ${user.isBlocked ? 'text-green-600' : 'text-red-600'}`} /> {user.isBlocked ? 'Unblock User' : 'Block Access'}
                                </button>
                                <button onClick={() => handleDelete(user._id)} className="px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" /> Archive User
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
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
