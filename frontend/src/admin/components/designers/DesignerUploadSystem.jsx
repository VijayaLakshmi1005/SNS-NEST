import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { UploadCloud, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function DesignerUploadSystem({ designerId }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Real upload logic would go here
      alert(`File dropped: ${e.dataTransfer.files[0].name}`);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-[#8b8175]" /> Design Revisions & Uploads
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Upload Zone */}
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive ? 'border-[#2d2a26] bg-[#f5f5f0]' : 'border-[#e5e0d8] hover:border-[#d4cecb]'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <UploadCloud className="w-8 h-8 mx-auto text-[#8b8175] mb-4" />
          <p className="text-sm font-medium text-[#2d2a26]">Drag and drop design files here</p>
          <p className="text-xs text-[#8b8175] mt-1">Supports PDF, JPG, PNG, MP4 up to 50MB</p>
          <button className="mt-4 px-4 py-2 bg-[#2d2a26] text-white text-sm rounded-xl hover:bg-[#1a1816]">
            Browse Files
          </button>
        </div>

        {/* Recent Uploads Feed */}
        <div>
          <h4 className="font-bold text-sm text-[#2d2a26] mb-4">Recent Submissions</h4>
          <div className="space-y-3">
            {/* Mock Submission 1 */}
            <div className="p-4 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl flex items-start gap-4">
              <div className="w-12 h-12 bg-[#e5e0d8] rounded-lg shrink-0 flex items-center justify-center">
                <span className="text-xs font-bold">2D</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h5 className="font-medium text-sm text-[#2d2a26]">Living Room Layout - V2</h5>
                  <span className="flex items-center gap-1 text-[10px] bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full border border-yellow-200">
                    <Clock className="w-3 h-3" /> Pending Client Review
                  </span>
                </div>
                <p className="text-xs text-[#8b8175] mt-1">Project: The Azure Villa</p>
                <div className="mt-2 text-xs text-[#2d2a26] bg-white p-2 rounded-lg border border-[#e5e0d8]">
                  <span className="font-bold">Designer Note:</span> Expanded the walking space near the kitchen island as requested.
                </div>
              </div>
            </div>

            {/* Mock Submission 2 */}
            <div className="p-4 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl flex items-start gap-4 opacity-75">
              <div className="w-12 h-12 bg-[#e5e0d8] rounded-lg shrink-0 flex items-center justify-center">
                <span className="text-xs font-bold">3D</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h5 className="font-medium text-sm text-[#2d2a26]">Master Bedroom Render - V1</h5>
                  <span className="flex items-center gap-1 text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200">
                    <AlertCircle className="w-3 h-3" /> Revision Requested
                  </span>
                </div>
                <p className="text-xs text-[#8b8175] mt-1">Project: The Azure Villa</p>
                <div className="mt-2 text-xs text-red-700 bg-red-50 p-2 rounded-lg border border-red-100">
                  <span className="font-bold">Client Feedback:</span> The lighting feels a bit too cold. Can we warm up the bedside lamps?
                </div>
              </div>
            </div>

            {/* Mock Submission 3 */}
            <div className="p-4 bg-white border border-green-200 rounded-xl flex items-start gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg shrink-0 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h5 className="font-medium text-sm text-[#2d2a26]">Kitchen Elevation - Final</h5>
                  <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                    <CheckCircle className="w-3 h-3" /> Approved
                  </span>
                </div>
                <p className="text-xs text-[#8b8175] mt-1">Project: The Azure Villa</p>
              </div>
            </div>

          </div>
        </div>

      </CardContent>
    </Card>
  );
}
