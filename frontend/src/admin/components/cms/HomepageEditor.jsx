import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { Save, Image as ImageIcon, Layout, ArrowUp, ArrowDown, Upload, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

const defaultSections = [
  { sectionId: 'hero', isActive: true, order: 1, content: { title: 'SCULPTING LUXURY', subtitle: 'Interior design that redefines modern living.', mediaUrl: '' } },
  { sectionId: 'services', isActive: true, order: 2, content: { title: 'Our Expertise' } },
  { sectionId: 'portfolio', isActive: true, order: 3, content: { title: 'Signature Collections' } },
  { sectionId: 'testimonials', isActive: true, order: 4, content: { title: 'Client Stories' } }
];

export default function HomepageEditor({ initialData }) {
  const queryClient = useQueryClient();
  const [sections, setSections] = useState(initialData?.sections?.length > 0 ? initialData.sections : defaultSections);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadTarget, setUploadTarget] = useState(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.patch(`${API_URL}/cms/pages/homepage`, { sections }, { withCredentials: true, transports: ['websocket', 'polling'] });
      queryClient.invalidateQueries(['admin-cms']);
    } catch (err) {
      console.error('Failed to save homepage', err);
      alert('Failed to save layout. Please try again.');
    }
    setIsSaving(false);
  };

  const updateSection = (index, field, value) => {
    const newSections = [...sections];
    if (!newSections[index].content) newSections[index].content = {};
    newSections[index].content[field] = value;
    setSections(newSections);
  };

  const toggleActive = (index) => {
    const newSections = [...sections];
    newSections[index].isActive = !newSections[index].isActive;
    setSections(newSections);
  };

  const moveSection = (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === sections.length - 1) return;
    
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + direction];
    newSections[index + direction] = temp;
    
    // Update orders
    newSections.forEach((sec, i) => sec.order = i + 1);
    setSections(newSections);
  };

  const triggerUpload = (index, field) => {
    setUploadTarget({ index, field });
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('media', file);

    try {
      const res = await axios.post(`${API_URL}/cms/upload`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.url) {
        updateSection(uploadTarget.index, uploadTarget.field, res.data.url);
      }
    } catch (err) {
      alert('Failed to upload media');
    }
    setIsUploading(false);
    setUploadTarget(null);
    e.target.value = '';
  };

  return (
    <Card className="bg-white border-[#e5e0d8] shadow-md h-[650px] flex flex-col">
      <CardHeader className="border-b border-[#e5e0d8] bg-[#fcfbf9] pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-[#2d2a26] flex items-center gap-2">
          <Layout className="w-5 h-5" /> Homepage Structure
        </CardTitle>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-[#656d4a] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#5a6142] transition-all disabled:opacity-50 shadow-sm"
        >
          <Save className="w-4 h-4" /> {isSaving ? 'Publishing...' : 'Publish Layout'}
        </button>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fcfbf9]">
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        
        {sections.sort((a, b) => a.order - b.order).map((section, idx) => (
          <div key={section.sectionId} className={`p-5 rounded-xl border transition-all ${section.isActive ? 'bg-white border-[#e5e0d8] shadow-sm' : 'bg-gray-50 border-dashed opacity-60'}`}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f5f2eb]">
              <h3 className="font-bold text-[#2d2a26] uppercase text-sm tracking-widest">{section.sectionId} SECTION</h3>
              <div className="flex items-center gap-4">
                <button onClick={() => toggleActive(idx)} className="text-xs font-bold text-[#8b8175] hover:text-[#2d2a26] transition-colors">
                  {section.isActive ? 'Disable' : 'Enable'}
                </button>
                <div className="flex gap-2 bg-[#fcfbf9] p-1 rounded-md border border-[#e5e0d8]">
                  <ArrowUp onClick={() => moveSection(idx, -1)} className={`w-4 h-4 cursor-pointer ${idx === 0 ? 'text-gray-300' : 'text-[#8b8175] hover:text-[#2d2a26]'}`} />
                  <ArrowDown onClick={() => moveSection(idx, 1)} className={`w-4 h-4 cursor-pointer ${idx === sections.length - 1 ? 'text-gray-300' : 'text-[#8b8175] hover:text-[#2d2a26]'}`} />
                </div>
              </div>
            </div>

            {section.isActive && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#8b8175] font-medium mb-1 block">Main Title</label>
                  <input 
                    type="text" 
                    value={section.content?.title || ''} 
                    onChange={(e) => updateSection(idx, 'title', e.target.value)}
                    className="w-full border border-[#e5e0d8] rounded-lg px-4 py-2 text-sm text-[#2d2a26] focus:outline-none focus:border-[#2d2a26] bg-[#fcfbf9]"
                  />
                </div>
                {['hero', 'portfolio'].includes(section.sectionId) && (
                  <>
                    {section.sectionId === 'hero' && (
                      <div>
                        <label className="text-xs text-[#8b8175] font-medium mb-1 block">Subtitle</label>
                        <input 
                          type="text" 
                          value={section.content?.subtitle || ''} 
                          onChange={(e) => updateSection(idx, 'subtitle', e.target.value)}
                          className="w-full border border-[#e5e0d8] rounded-lg px-4 py-2 text-sm text-[#2d2a26] focus:outline-none focus:border-[#2d2a26] bg-[#fcfbf9]"
                        />
                      </div>
                    )}
                    <div>
                      <label className="text-xs text-[#8b8175] font-medium mb-2 block">Background / Cover Image</label>
                      <div className="flex items-center gap-4">
                        {section.content?.mediaUrl ? (
                          <div className="relative group w-32 h-20 rounded-lg overflow-hidden border border-[#e5e0d8]">
                            <img src={section.content.mediaUrl} alt="Cover" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button onClick={() => triggerUpload(idx, 'mediaUrl')} className="p-1.5 bg-white rounded-md hover:bg-gray-100 text-[#2d2a26]"><Upload className="w-3 h-3" /></button>
                              <button onClick={() => updateSection(idx, 'mediaUrl', '')} className="p-1.5 bg-red-500 rounded-md hover:bg-red-600 text-white"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => triggerUpload(idx, 'mediaUrl')}
                            disabled={isUploading}
                            className="flex items-center justify-center flex-col w-32 h-20 border-2 border-dashed border-[#e5e0d8] rounded-lg text-[#8b8175] hover:bg-[#fcfbf9] hover:border-[#2d2a26] transition-all disabled:opacity-50"
                          >
                            <ImageIcon className="w-5 h-5 mb-1" />
                            <span className="text-[10px] font-medium">{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                          </button>
                        )}
                        <input 
                          type="text" 
                          value={section.content?.mediaUrl || ''} 
                          onChange={(e) => updateSection(idx, 'mediaUrl', e.target.value)}
                          placeholder="Or paste URL here..."
                          className="flex-1 border border-[#e5e0d8] rounded-lg px-4 py-2 text-sm text-[#2d2a26] focus:outline-none focus:border-[#2d2a26] bg-[#fcfbf9]"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
