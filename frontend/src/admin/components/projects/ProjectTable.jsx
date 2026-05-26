import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, Briefcase, Eye, Clock, Building2, Home } from 'lucide-react';

export default function ProjectTable({ projects, isLoading, onOpenWorkspace }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredProjects = projects.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.projectType?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <select 
            className="px-4 py-2 bg-white border border-[#e5e0d8] rounded-xl text-sm font-medium text-[#2d2a26] hover:bg-[#fcfbf9] transition-colors focus:outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          >
            <option value="">All Project Types</option>
            <optgroup label="Residential">
              <option value="Residential Interior Design">Residential Interior Design</option>
              <option value="Living Room Design">Living Room Design</option>
              <option value="Bedroom Design">Bedroom Design</option>
              <option value="Modular Kitchen Design">Modular Kitchen Design</option>
              <option value="Wardrobe Design">Wardrobe Design</option>
              <option value="False Ceiling Design">False Ceiling Design</option>
              <option value="TV Unit Design">TV Unit Design</option>
              <option value="Space Planning">Space Planning</option>
            </optgroup>
            <optgroup label="Commercial">
              <option value="Commercial Interior Design">Commercial Interior Design</option>
              <option value="Office Interiors">Office Interiors</option>
              <option value="Retail Shop Interiors">Retail Shop Interiors</option>
              <option value="Showroom Design">Showroom Design</option>
              <option value="Reception Area Design">Reception Area Design</option>
            </optgroup>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="border-b border-[#e5e0d8] bg-white">
              <th className="px-6 py-4 text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Project</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Client & Assigned</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Progress</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Payments</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Timeline</th>
              <th className="px-6 py-4 text-right">Workspace</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e0d8] bg-white">
            <AnimatePresence>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-[#8b8175]">Loading ecosystem...</td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-[#8b8175]">No projects found.</td>
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
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#fcfbf9] border border-[#e5e0d8] flex items-center justify-center">
                           {project.projectType === 'Commercial' ? <Building2 className="w-5 h-5 text-[#8b8175]" /> : <Home className="w-5 h-5 text-[#8b8175]" />}
                        </div>
                        <div>
                          <div className="font-nav-style font-bold text-[#2d2a26]">{project.title}</div>
                          <div className="text-xs text-[#8b8175] mt-0.5">{project.projectType || 'Residential'} • ₹{(project.budget || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[#2d2a26]">
                        {project.client ? project.client.fullName : 'Unassigned'}
                      </div>
                      <div className="text-xs text-[#8b8175] mt-0.5">
                        Designer: {project.designer ? project.designer.name : 'Pending'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        project.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                        project.status === 'Delayed' ? 'bg-red-50 text-red-700 border-red-200' :
                        project.status === 'Draft' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-[#e5e0d8] rounded-full h-2 min-w-[100px]">
                          <div className="bg-[#2d2a26] h-2 rounded-full transition-all duration-500" style={{ width: `${project.progress || 0}%` }}></div>
                        </div>
                        <span className="text-xs font-medium text-[#2d2a26]">{project.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium ${
                        project.paymentStatus === 'Fully Paid' ? 'text-green-600' : 
                        project.paymentStatus === 'Overdue' ? 'text-red-600' : 
                        'text-orange-500'
                      }`}>
                        {project.paymentStatus || 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs text-[#8b8175]">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          Started: {new Date(project.startDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onOpenWorkspace(project._id)}
                          className="px-3 py-1.5 bg-[#2d2a26] text-white hover:bg-[#1a1816] rounded-xl text-xs font-medium transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-3.5 h-3.5" /> Workspace
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
