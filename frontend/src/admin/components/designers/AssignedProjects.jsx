import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Briefcase, AlertCircle, Clock } from 'lucide-react';

export default function AssignedProjects({ projects = [] }) {
  return (
    <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[#e5e0d8]">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[#8b8175]" /> Assigned Projects
        </CardTitle>
        <span className="bg-[#2d2a26] text-white text-xs px-2 py-1 rounded-md">
          {projects.length} Active
        </span>
      </CardHeader>
      <CardContent className="pt-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[#8b8175]">
            <Briefcase className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No active projects assigned.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map(project => (
              <div key={project._id} className="p-4 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-nav-style font-bold text-[#2d2a26]">{project.title || 'Untitled Project'}</h4>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[#8b8175]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Started: {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Status: {project.status}
                    </span>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-white border border-[#e5e0d8] text-xs font-medium text-[#2d2a26] hover:bg-[#e5e0d8] transition-colors rounded-lg">
                  Manage Workspace
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
