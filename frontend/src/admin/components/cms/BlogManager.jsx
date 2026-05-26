import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { PenTool, Plus, FileText, Globe, Upload, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

export default function BlogManager({ initialBlogs = [] }) {
  const queryClient = useQueryClient();
  const [blogs, setBlogs] = useState(initialBlogs);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleCreateNew = () => {
    setCurrentBlog({ title: '', slug: '', content: '', status: 'Draft', coverImage: '', seo: { title: '', description: '' } });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (currentBlog._id) {
        await axios.patch(`${API_URL}/cms/blogs/${currentBlog._id}`, currentBlog, { withCredentials: true, transports: ['websocket', 'polling'] });
      } else {
        await axios.post(`${API_URL}/cms/blogs`, currentBlog, { withCredentials: true, transports: ['websocket', 'polling'] });
      }
      queryClient.invalidateQueries(['admin-cms']);
      setIsEditing(false);
      setCurrentBlog(null);
    } catch (err) {
      console.error('Failed to save blog', err);
      alert('Failed to save article.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('media', file);

    try {
      const res = await axios.post(`${API_URL}/cms/upload`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.url) {
        setCurrentBlog({ ...currentBlog, coverImage: res.data.url });
      }
    } catch (err) {
      alert('Failed to upload cover image');
    }
    setIsUploading(false);
    e.target.value = '';
  };

  if (isEditing) {
    return (
      <Card className="bg-white border-[#e5e0d8] shadow-md h-[650px] flex flex-col">
        <CardHeader className="border-b border-[#e5e0d8] bg-[#fcfbf9] pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-[#2d2a26] text-sm">Editing Article</CardTitle>
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(false)} className="text-xs px-3 text-[#8b8175]">Cancel</button>
            <button onClick={handleSave} className="bg-[#2d2a26] text-white px-4 py-2 rounded-xl text-xs font-bold">Save Post</button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

          <div className="relative group w-full h-48 rounded-xl overflow-hidden border-2 border-dashed border-[#e5e0d8] bg-[#fcfbf9] flex items-center justify-center">
            {currentBlog.coverImage ? (
              <>
                <img src={currentBlog.coverImage} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg text-sm font-bold text-[#2d2a26]">
                    <Upload className="w-4 h-4" /> Change Cover
                  </button>
                  <button onClick={() => setCurrentBlog({...currentBlog, coverImage: ''})} className="flex items-center gap-2 bg-red-500 px-3 py-1.5 rounded-lg text-sm font-bold text-white">
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex flex-col items-center gap-2 text-[#8b8175] hover:text-[#2d2a26] transition-colors"
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm font-medium">{isUploading ? 'Uploading...' : 'Add Cover Image'}</span>
              </button>
            )}
          </div>

          <input 
            type="text" 
            placeholder="Article Title..." 
            value={currentBlog.title}
            onChange={e => setCurrentBlog({...currentBlog, title: e.target.value})}
            className="w-full text-2xl font-nav-style font-bold border-none outline-none text-[#2d2a26] placeholder-[#e5e0d8]"
          />
          <input 
            type="text" 
            placeholder="URL Slug (e.g. interior-tips)" 
            value={currentBlog.slug}
            onChange={e => setCurrentBlog({...currentBlog, slug: e.target.value})}
            className="w-full text-sm text-[#8b8175] border-none outline-none font-mono"
          />
          <textarea 
            placeholder="Write your article in Markdown..." 
            value={currentBlog.content}
            onChange={e => setCurrentBlog({...currentBlog, content: e.target.value})}
            className="w-full h-64 border border-[#e5e0d8] rounded-xl p-4 text-[#2d2a26] focus:outline-none resize-none font-sans bg-[#fcfbf9]"
          />
          
          <div className="pt-4 border-t border-[#e5e0d8]">
            <h4 className="text-sm font-bold text-[#2d2a26] mb-3">SEO Meta Data</h4>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="SEO Title"
                value={currentBlog.seo?.title || ''}
                onChange={e => setCurrentBlog({...currentBlog, seo: { ...currentBlog.seo, title: e.target.value }})}
                className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm text-[#2d2a26] focus:outline-none focus:border-[#2d2a26]"
              />
              <input 
                type="text" 
                placeholder="SEO Description"
                value={currentBlog.seo?.description || ''}
                onChange={e => setCurrentBlog({...currentBlog, seo: { ...currentBlog.seo, description: e.target.value }})}
                className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm text-[#2d2a26] focus:outline-none focus:border-[#2d2a26]"
              />
            </div>
          </div>

          <div className="flex justify-between items-center bg-[#fcfbf9] p-4 rounded-xl border border-[#e5e0d8] mt-4">
            <span className="text-xs font-bold text-[#8b8175]">STATUS</span>
            <select 
              value={currentBlog.status}
              onChange={e => setCurrentBlog({...currentBlog, status: e.target.value})}
              className="bg-white border border-[#e5e0d8] rounded-lg px-3 py-1 text-sm font-bold text-[#2d2a26]"
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-[#e5e0d8] shadow-md h-[650px] flex flex-col">
      <CardHeader className="border-b border-[#e5e0d8] bg-[#fcfbf9] pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-[#2d2a26] flex items-center gap-2">
          <PenTool className="w-5 h-5" /> Article Management
        </CardTitle>
        <button onClick={handleCreateNew} className="flex items-center gap-1 bg-[#fcfbf9] border border-[#e5e0d8] text-[#2d2a26] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#e5e0d8]">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fcfbf9]">
        {blogs.length === 0 ? (
          <div className="text-center py-12 text-[#8b8175]">No articles written yet.</div>
        ) : (
          blogs.map(blog => (
            <div key={blog._id} className="bg-white p-4 rounded-xl border border-[#e5e0d8] flex items-center justify-between group hover:shadow-sm transition-all cursor-pointer" onClick={() => { setCurrentBlog(blog); setIsEditing(true); }}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden border border-[#e5e0d8] ${blog.status === 'Published' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                  {blog.coverImage ? (
                    <img src={blog.coverImage} alt="cover" className="w-full h-full object-cover" />
                  ) : (
                    blog.status === 'Published' ? <Globe className="w-5 h-5" /> : <FileText className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-[#2d2a26] group-hover:text-blue-600 transition-colors">{blog.title}</h4>
                  <p className="text-xs text-[#8b8175]">/{blog.slug} • {new Date(blog.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${blog.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {blog.status}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
