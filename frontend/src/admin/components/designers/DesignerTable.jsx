import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, Briefcase, Star, Eye } from 'lucide-react';

export default function DesignerTable({ designers, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredDesigners = designers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <button className="px-4 py-2 bg-white border border-[#e5e0d8] rounded-xl text-sm font-medium text-[#2d2a26] hover:bg-[#fcfbf9] transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter Status
          </button>
          <button className="px-4 py-2 bg-[#2d2a26] text-white rounded-xl text-sm font-medium hover:bg-[#1a1816] transition-colors shadow-sm">
            + Add Designer
          </button>
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
              <th className="px-6 py-4 text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Rating</th>
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm font-medium text-[#2d2a26]">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {designer.rating}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/admin/designers/${designer._id}`}
                          className="p-2 text-[#8b8175] hover:bg-[#e5e0d8] hover:text-[#2d2a26] rounded-xl transition-colors"
                          title="View 360° Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
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
