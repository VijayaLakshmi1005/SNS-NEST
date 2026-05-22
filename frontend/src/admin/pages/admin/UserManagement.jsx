import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import UserTable from '../../components/users/UserTable';
import { useUsers } from '../../hooks/useUsers';

export default function UserManagement() {
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: '', role: '', status: '' });
  const { usersQuery, blockMutation } = useUsers(filters);

  const data = usersQuery.data?.data || { users: [], pagination: {} };
  const users = data.users;

  // Derive metrics
  const totalUsers = data.pagination?.total || 0;
  const verifiedUsers = users.filter(u => u.isVerified).length;
  const blockedUsers = users.filter(u => u.isBlocked).length;

  const handleBlockUser = (userId, reason) => {
    blockMutation.mutate({ userId, reason });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="font-nav-style text-3xl font-extrabold text-[#2d2a26]">Client Relationship Management</h1>
        <p className="font-sans text-[#8b8175] mt-2">Real-time luxury client overview and interactions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={Users} label="Total Clients" value={totalUsers} color="text-blue-600" />
        <MetricCard icon={UserCheck} label="Verified" value={verifiedUsers} color="text-green-600" />
        <MetricCard icon={UserX} label="Blocked" value={blockedUsers} color="text-red-600" />
        <MetricCard icon={AlertCircle} label="Pending Queries" value={0} color="text-yellow-600" />
      </div>

      <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
        <CardContent className="p-6">
          <UserTable 
            users={users} 
            pagination={data.pagination} 
            isLoading={usersQuery.isLoading} 
            onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
            onBlock={handleBlockUser}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-[#e5e0d8] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#8b8175] mb-1">{label}</p>
          <h3 className="font-nav-style text-2xl font-bold text-[#2d2a26]">{value}</h3>
        </div>
        <div className={`p-3 rounded-full bg-[#fcfbf9] border border-[#e5e0d8] ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}
