import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { X, UploadCloud, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

export default function AdminUploadStudio({ isOpen, onClose }) {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Product',
    category: 'Furniture',
    basePrice: ''
  });
  const queryClient = useQueryClient();

  const onDrop = useCallback(acceptedFiles => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx']
    }
  });

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    if (!formData.title) return alert('Please enter a title');
    setIsUploading(true);
    setProgress(10);
    
    const payload = new FormData();
    files.forEach(file => payload.append('media', file));
    
    // Append JSON metadata
    payload.append('data', JSON.stringify({
      title: formData.title,
      type: formData.type,
      category: formData.category,
      basePrice: Number(formData.basePrice) || 0
    }));
    
    setTimeout(() => setProgress(40), 500);

    try {
      await axios.post(`${API_URL}/catalog/upload`, payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (percentCompleted < 90) setProgress(40 + (percentCompleted / 2));
        }
      });
      
      setProgress(100);
      setTimeout(() => {
        queryClient.invalidateQueries(['admin-catalog']);
        setFiles([]);
        setFormData({ title: '', type: 'Product', category: 'Furniture', basePrice: '' });
        setIsUploading(false);
        onClose();
      }, 500);
    } catch (err) {
      alert('Upload failed');
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#2d2a26]/20 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-[#fcfbf9] rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 bg-white border-b border-[#e5e0d8]">
          <div>
            <h2 className="font-nav-style text-xl font-bold text-[#2d2a26]">AI Upload Studio</h2>
            <p className="text-xs text-[#8b8175] mt-1">Upload images or PDFs. AI will auto-extract text and styles.</p>
          </div>
          <button onClick={!isUploading ? onClose : undefined} className="p-2 text-[#8b8175] hover:bg-[#fcfbf9] rounded-full transition-colors disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Item Title</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                placeholder="e.g., Minimalist Oak Dining Table" 
                className="w-full px-4 py-2 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:border-[#2d2a26]" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Type</label>
              <select 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})} 
                className="w-full px-4 py-2 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:border-[#2d2a26]"
              >
                <option value="Product">Product</option>
                <option value="Service">Service</option>
                <option value="Concept">Concept</option>
                <option value="Package">Package</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Category</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})} 
                className="w-full px-4 py-2 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:border-[#2d2a26]"
              >
                <option value="Furniture">Furniture</option>
                <option value="Decor">Decor</option>
                <option value="Lighting">Lighting</option>
                <option value="Interior Design">Interior Design</option>
                <option value="Consultation">Consultation</option>
              </select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Base Price (INR)</label>
              <input 
                type="number" 
                value={formData.basePrice} 
                onChange={e => setFormData({...formData, basePrice: e.target.value})} 
                placeholder="e.g., 25000" 
                className="w-full px-4 py-2 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:border-[#2d2a26]" 
              />
            </div>
          </div>

          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              isDragActive ? 'border-[#2d2a26] bg-[#f5f2eb]' : 'border-[#e5e0d8] hover:border-[#2d2a26]/50 bg-white'
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud className={`w-10 h-10 mb-4 ${isDragActive ? 'text-[#2d2a26]' : 'text-[#8b8175]'}`} />
            <p className="text-sm font-medium text-[#2d2a26] text-center">
              Drag & drop media files here, or click to select
            </p>
            <p className="text-xs text-[#8b8175] mt-2">Supports JPG, PNG, PDF, DOCX (Max 50MB)</p>
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider">Staging Area ({files.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {files.map((file, i) => (
                  <div key={i} className="relative group bg-white border border-[#e5e0d8] rounded-xl p-3 flex items-center gap-3">
                    {file.type.includes('image') ? <ImageIcon className="w-6 h-6 text-blue-500" /> : <FileText className="w-6 h-6 text-orange-500" />}
                    <div className="flex-1 truncate">
                      <p className="text-xs font-medium text-[#2d2a26] truncate">{file.name}</p>
                      <p className="text-[10px] text-[#8b8175]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-[#2d2a26]">
                <span>{progress < 90 ? 'Uploading...' : 'AI Extracting Metadata...'}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-[#e5e0d8] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#2d2a26] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-[#e5e0d8] flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isUploading}
            className="px-5 py-2.5 text-sm font-medium text-[#8b8175] hover:text-[#2d2a26] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className="flex items-center gap-2 bg-[#2d2a26] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1a1816] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing</> : 'Process & Upload'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
