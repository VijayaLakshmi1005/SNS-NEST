import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, Briefcase, Star, Eye } from 'lucide-react';

export default function DesignerTable({ designers, isLoading, onEdit, onDelete, onView }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const filteredDesigners = designers.filter(d => {
    const matchesSearch = (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (d.specialization || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white border border-[#e5e0d8] rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Table Header/Controls */}
      <div className="p-6 border-b border-[#e5e0d8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fcfbf9]">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8175]" />
          <input
            type="text"
            placeholder="Search designers by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d4cecb] transition-shadow"
          />
        </div>
        <div className="flex items-center gap-3">
          <select 
            onChange={(e) => setStatusFilter(e.target.value)}
            value={statusFilter}
            className="px-4 py-2 bg-white border border-[#e5e0d8] rounded-xl text-sm font-medium text-[#2d2a26] hover:bg-[#fcfbf9] transition-colors focus:outline-none appearance-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
            <option value="In Consultation">In Consultation</option>
            <option value="Offline">Offline</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-[#e5e0d8] bg-white">
              <th className="px-6 py-4 text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Designer</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Specialization</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Active Projects</th>

              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e0d8] bg-white">
            <AnimatePresence>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-[#8b8175]">
                    Loading ecosystem data...
                  </td>
                </tr>
              ) : filteredDesigners.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-[#8b8175]">
                    No designers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredDesigners.map((designer) => (
                  <motion.tr 
                    key={designer._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-[#fcfbf9] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#e5e0d8] flex items-center justify-center overflow-hidden">
                          {designer.profileImage ? (
                            <img src={designer.profileImage} alt={designer.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[#2d2a26] font-bold font-nav-style">{designer.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-nav-style font-bold text-[#2d2a26]">{designer.name}</div>
                          <div className="text-xs text-[#8b8175]">{designer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#2d2a26]">
                      {designer.specialization}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        designer.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                        designer.status === 'Busy' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {designer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-[#2d2a26]">
                        <Briefcase className="w-4 h-4 text-[#8b8175]" />
                        {designer.activeProjects?.length || 0} Projects
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(designer)}
                          className="p-2 text-[#8b8175] hover:bg-[#e5e0d8] hover:text-[#2d2a26] rounded-xl transition-colors"
                          title="Edit Designer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                        <button
                          onClick={() => {
                            if(window.confirm('Are you sure you want to delete this designer?')) {
                              onDelete(designer._id);
                            }
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                          title="Delete Designer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                        <button 
                          onClick={() => onView(designer)}
                          className="p-2 text-[#8b8175] hover:bg-[#e5e0d8] hover:text-[#2d2a26] rounded-xl transition-colors"
                          title="View 360° Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
