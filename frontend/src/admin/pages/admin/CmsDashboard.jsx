import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { LayoutTemplate, FileText, Globe, Eye, MonitorPlay } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import HomepageEditor from '../../components/cms/HomepageEditor';
import BlogManager from '../../components/cms/BlogManager';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const fetchCmsData = async () => {
  const [pagesRes, blogsRes] = await Promise.all([
    axios.get(`${API_URL}/cms/pages/homepage`),
    axios.get(`${API_URL}/cms/blogs`)
  ]);
  return { homepage: pagesRes.data.data, blogs: blogsRes.data.data };
};

export default function CmsDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-cms'],
    queryFn: fetchCmsData,
    refetchInterval: 5000
  });

  if (isLoading) return <div className="p-8 text-[#8b8175] text-center">Loading Content Management System...</div>;

  const totalBlogs = data?.blogs?.length || 0;
  const activeSections = data?.homepage?.sections?.filter(s => s.isActive).length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-nav-style text-3xl font-extrabold text-[#2d2a26]">CMS Operating System</h1>
          <p className="font-sans text-[#8b8175]">Visual content and blog management.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#2d2a26] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1a1816] transition-all shadow-sm">
          <MonitorPlay className="w-4 h-4" /> Live Preview
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8b8175]">Published Blogs</CardTitle>
            <FileText className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-nav-style font-bold text-[#2d2a26]">{totalBlogs}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8b8175]">Active Homepage Sections</CardTitle>
            <LayoutTemplate className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-nav-style font-bold text-[#2d2a26]">{activeSections} / 8</div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8b8175]">SEO Health Score</CardTitle>
            <Globe className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-nav-style font-bold text-purple-600">92%</div>
            <p className="text-xs text-[#8b8175] mt-1">Excellent metadata</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <HomepageEditor initialData={data?.homepage} />
        <BlogManager initialBlogs={data?.blogs} />
      </div>

    </div>
  );
}
