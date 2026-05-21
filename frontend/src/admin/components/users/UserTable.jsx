import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, MoreVertical, ShieldBan, ShieldCheck, Mail, Eye } from 'lucide-react';

export default function UserTable({ users, pagination, isLoading, onFilterChange, onBlock }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    onFilterChange({ search: e.target.value, page: 1 });
  };

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center text-[#8b8175]">Loading CRM data...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8175]" />
          <input 
            type="text" 
            placeholder="Search clients by name or email..." 
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4cecb] transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select 
            onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
            className="px-4 py-2 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d4cecb]"
          >
            <option value="">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e5e0d8] text-[#8b8175] text-sm font-medium">
              <th className="pb-3 pl-4">Client</th>
              <th className="pb-3">Contact</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Active Projects</th>
              <th className="pb-3">Joined</th>
              <th className="pb-3 text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <motion.tr 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={user._id} 
                className="border-b border-[#e5e0d8]/50 hover:bg-[#fcfbf9]/50 transition-colors group"
              >
                <td className="py-4 pl-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#e5e0d8] flex items-center justify-center font-nav-style font-bold text-[#2d2a26]">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-[#2d2a26]">{user.fullName}</p>
                      <p className="text-xs text-[#8b8175] capitalize">{user.role}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <p className="text-sm text-[#2d2a26]">{user.email}</p>
                  <p className="text-xs text-[#8b8175]">{user.mobile}</p>
                </td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 text-xs rounded-full border ${
                    user.isBlocked ? 'bg-red-50 text-red-600 border-red-200' :
                    user.isVerified ? 'bg-green-50 text-green-600 border-green-200' :
                    'bg-yellow-50 text-yellow-600 border-yellow-200'
                  }`}>
                    {user.isBlocked ? 'Blocked' : user.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="py-4">
                  <div className="text-sm font-medium text-[#2d2a26]">{user.activeProjectCount || 0}</div>
                </td>
                <td className="py-4 text-sm text-[#8b8175]">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="py-4 text-right pr-4">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/admin/users/${user._id}`} className="p-2 hover:bg-[#e5e0d8] rounded-lg transition-colors text-[#8b8175] hover:text-[#2d2a26]">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button className="p-2 hover:bg-[#e5e0d8] rounded-lg transition-colors text-[#8b8175] hover:text-[#2d2a26]">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        const reason = window.prompt(`Reason to ${user.isBlocked ? 'unblock' : 'block'} ${user.fullName}?`);
                        if (reason !== null) onBlock(user._id, reason);
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                    >
                      {user.isBlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-12 text-[#8b8175]">No clients found matching the criteria.</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4 border-t border-[#e5e0d8]">
        <p className="text-sm text-[#8b8175]">
          Showing page {pagination?.page || 1} of {pagination?.pages || 1}
        </p>
        <div className="flex gap-2">
          <button 
            disabled={pagination?.page <= 1}
            onClick={() => onFilterChange({ page: pagination.page - 1 })}
            className="px-4 py-2 text-sm border border-[#e5e0d8] rounded-xl hover:bg-[#fcfbf9] disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <button 
            disabled={pagination?.page >= pagination?.pages}
            onClick={() => onFilterChange({ page: pagination.page + 1 })}
            className="px-4 py-2 text-sm border border-[#e5e0d8] rounded-xl hover:bg-[#fcfbf9] disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
