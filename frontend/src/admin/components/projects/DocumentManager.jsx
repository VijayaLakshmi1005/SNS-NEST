import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { FileStack, Upload, FileText, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

export default function DocumentManager({ projectId, uploads = [] }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      try {
        // In a real scenario, this would be a FormData upload to AWS/Cloudinary
        const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';
        await axios.post(`${API_URL}/projects/${projectId}/upload`, {
          fileName: file.name,
          fileType: 'Other',
          requiresApproval: false
        }, { withCredentials: true });
        
        // Let the parent query refetch or use socket for updates
        window.location.reload(); // Simple refresh for now to see updates
      } catch (err) {
        console.error("Upload failed", err);
      }
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileStack className="w-5 h-5 text-[#8b8175]" /> Documents & Renders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Upload Zone */}
        <div 
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
            dragActive ? 'border-[#2d2a26] bg-[#f5f5f0]' : 'border-[#e5e0d8] hover:border-[#d4cecb] bg-[#fcfbf9]'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-6 h-6 mx-auto text-[#8b8175] mb-2" />
          <p className="text-xs font-medium text-[#2d2a26]">Drag files or click to upload</p>
        </div>

        {/* Uploads List */}
        <div className="space-y-3">
          {uploads.length === 0 ? (
            <p className="text-center text-xs text-[#8b8175]">No documents uploaded.</p>
          ) : (
            uploads.map((doc, i) => (
              <div key={doc._id || i} className="p-3 border border-[#e5e0d8] rounded-xl flex items-start gap-3 bg-white">
                <div className="w-10 h-10 rounded-lg bg-[#fcfbf9] border border-[#e5e0d8] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[#8b8175]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-[#2d2a26] truncate pr-2">{doc.fileName}</p>
                    {doc.status === 'Approved' && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                    {doc.status === 'Pending Approval' && <Clock className="w-4 h-4 text-orange-500 shrink-0" />}
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-[#8b8175]">{doc.fileType}</p>
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View</a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </CardContent>
    </Card>
  );
}
