import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Target, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

export default function MilestoneTracker({ projectId, milestones = [] }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'In Progress': return <Circle className="w-5 h-5 text-blue-500" />;
      case 'Delayed': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Circle className="w-5 h-5 text-[#d4cecb]" />;
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#8b8175]" /> Timeline & Milestones
        </CardTitle>
      </CardHeader>
      <CardContent>
        {milestones.length === 0 ? (
          <div className="text-center py-8 text-[#8b8175] text-sm">
            No milestones defined yet.
          </div>
        ) : (
          <div className="relative border-l-2 border-[#e5e0d8] ml-3 space-y-6">
            {milestones.map((m, i) => (
              <div key={m._id || i} className="relative pl-6">
                <span className="absolute -left-[11px] top-1 bg-white">
                  {getStatusIcon(m.status)}
                </span>
                <div>
                  <h4 className={`text-sm font-bold ${m.status === 'Completed' ? 'text-green-700' : 'text-[#2d2a26]'}`}>
                    {m.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#8b8175]">
                    {m.dueDate && <span>Due: {new Date(m.dueDate).toLocaleDateString()}</span>}
                    {m.completedAt && <span className="text-green-600 border-l border-[#e5e0d8] pl-2">Done: {new Date(m.completedAt).toLocaleDateString()}</span>}
                  </div>
                  {m.comments && (
                    <p className="text-xs text-[#8b8175] mt-2 bg-[#fcfbf9] p-2 rounded-lg border border-[#e5e0d8]">
                      {m.comments}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
