import React, { useState } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { Save, Image as ImageIcon, Layout, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const defaultSections = [
  { sectionId: 'hero', isActive: true, order: 1, content: { title: 'SCULPTING LUXURY', subtitle: 'Interior design that redefines modern living.', ctaText: 'Start Visualizing' } },
  { sectionId: 'gallery', isActive: true, order: 2, content: { title: 'Featured Projects' } },
  { sectionId: 'testimonials', isActive: true, order: 3, content: { title: 'Client Stories' } }
];

export default function HomepageEditor({ initialData }) {
  const queryClient = useQueryClient();
  const [sections, setSections] = useState(initialData?.sections?.length > 0 ? initialData.sections : defaultSections);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.patch(`${API_URL}/cms/pages/homepage`, { sections }, { withCredentials: true });
      queryClient.invalidateQueries(['admin-cms']);
    } catch (err) {
      console.error('Failed to save homepage', err);
    }
    setIsSaving(false);
  };

  const updateSection = (index, field, value) => {
    const newSections = [...sections];
    newSections[index].content[field] = value;
    setSections(newSections);
  };

  const toggleActive = (index) => {
    const newSections = [...sections];
    newSections[index].isActive = !newSections[index].isActive;
    setSections(newSections);
  };

  return (
    <Card className="bg-white border-[#e5e0d8] shadow-md h-[600px] flex flex-col">
      <CardHeader className="border-b border-[#e5e0d8] bg-[#fcfbf9] pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-[#2d2a26] flex items-center gap-2">
          <Layout className="w-5 h-5" /> Homepage Structure
        </CardTitle>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-[#656d4a] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#5a6142] transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {isSaving ? 'Publishing...' : 'Publish Layout'}
        </button>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fcfbf9]">
        {sections.sort((a, b) => a.order - b.order).map((section, idx) => (
          <div key={section.sectionId} className={`p-4 rounded-xl border transition-all ${section.isActive ? 'bg-white border-[#e5e0d8] shadow-sm' : 'bg-gray-50 border-dashed opacity-60'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#2d2a26] uppercase text-sm tracking-widest">{section.sectionId} SECTION</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => toggleActive(idx)} className="text-xs font-bold text-[#8b8175]">
                  {section.isActive ? 'Disable' : 'Enable'}
                </button>
                <div className="flex flex-col">
                  <ArrowUp className="w-3 h-3 text-[#8b8175] cursor-pointer hover:text-[#2d2a26]" />
                  <ArrowDown className="w-3 h-3 text-[#8b8175] cursor-pointer hover:text-[#2d2a26]" />
                </div>
              </div>
            </div>

            {section.isActive && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#8b8175] font-medium mb-1 block">Main Title</label>
                  <input 
                    type="text" 
                    value={section.content.title || ''} 
                    onChange={(e) => updateSection(idx, 'title', e.target.value)}
                    className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm text-[#2d2a26] focus:outline-none focus:border-[#2d2a26]"
                  />
                </div>
                {section.sectionId === 'hero' && (
                  <>
                    <div>
                      <label className="text-xs text-[#8b8175] font-medium mb-1 block">Subtitle</label>
                      <input 
                        type="text" 
                        value={section.content.subtitle || ''} 
                        onChange={(e) => updateSection(idx, 'subtitle', e.target.value)}
                        className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm text-[#2d2a26] focus:outline-none focus:border-[#2d2a26]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#8b8175] font-medium mb-1 block">Hero Image URL</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8175]" />
                        <input 
                          type="text" 
                          value={section.content.mediaUrl || ''} 
                          onChange={(e) => updateSection(idx, 'mediaUrl', e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full border border-[#e5e0d8] rounded-lg pl-9 pr-3 py-2 text-sm text-[#2d2a26] focus:outline-none focus:border-[#2d2a26]"
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
