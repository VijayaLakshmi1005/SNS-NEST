import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, Briefcase, Eye, Clock } from 'lucide-react';

export default function ProjectTable({ projects, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredProjects = projects.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border border-[#e5e0d8] rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-[#e5e0d8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fcfbf9]">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8175]" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d4cecb]"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-[#e5e0d8] rounded-xl text-sm font-medium text-[#2d2a26] hover:bg-[#fcfbf9] transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter Status
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-[#e5e0d8] bg-white">
              <th className="px-6 py-4 text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Project Title</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Client</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Designer</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Timeline</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e0d8] bg-white">
            <AnimatePresence>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-[#8b8175]">Loading ecosystem...</td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-[#8b8175]">No projects found.</td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <motion.tr 
                    key={project._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-[#fcfbf9] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-nav-style font-bold text-[#2d2a26]">{project.title}</div>
                      <div className="text-xs text-[#8b8175] mt-1">₹{(project.budget || 0).toLocaleString()} Budget</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#2d2a26]">
                      {project.client ? `${project.client.firstName} ${project.client.lastName}` : 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#2d2a26]">
                      {project.designer ? project.designer.name : 'Unassigned'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        project.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                        project.status === 'Delayed' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-[#8b8175]">
                        <Clock className="w-3 h-3" />
                        {new Date(project.startDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/admin/projects/${project._id}`}
                          className="p-2 text-[#8b8175] hover:bg-[#e5e0d8] hover:text-[#2d2a26] rounded-xl transition-colors"
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
