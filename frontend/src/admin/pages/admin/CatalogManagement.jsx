import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Package, TrendingUp, AlertTriangle, Eye, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import CatalogGrid from '../../components/catalog/CatalogGrid';
import AdminUploadStudio from '../../components/catalog/AdminUploadStudio';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

const fetchCatalog = async () => {
  const res = await axios.get(`${API_URL}/catalog`, { withCredentials: true, transports: ['websocket', 'polling'] });
  return res.data;
};

export default function CatalogManagement() {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: catalogQuery, isLoading } = useQuery({
    queryKey: ['admin-catalog'],
    queryFn: fetchCatalog,
    refetchInterval: false // Now relying entirely on real-time sockets
  });

  useEffect(() => {
    // Assuming a global socket instance or you can import it if available.
    // For now we will rely on react-query invalidation triggered from top-level App.jsx or re-fetching on mount
    const interval = setInterval(() => {
      queryClient.invalidateQueries(['admin-catalog']);
    }, 5000);
    return () => clearInterval(interval);
  }, [queryClient]);

  const catalogItems = catalogQuery?.data || [];

  const total = catalogItems.length;
  const lowStock = catalogItems.filter(p => p.inventory?.status === 'Low Stock' || p.inventory?.status === 'Out of Stock').length;
  const totalViews = catalogItems.reduce((sum, p) => sum + (p.stats?.views || 0), 0);
  const totalSaves = catalogItems.reduce((sum, p) => sum + (p.stats?.wishlistSaves || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-nav-style text-3xl font-extrabold text-[#2d2a26]">Catalog Ecosystem</h1>
          <p className="font-sans text-[#8b8175]">Real-time luxury product and inventory management.</p>
        </div>
        <button 
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 bg-[#2d2a26] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1a1816] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8b8175]">Total Products</CardTitle>
            <Package className="w-4 h-4 text-[#2d2a26]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-nav-style font-bold text-[#2d2a26]">{total}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Low Inventory</CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-nav-style font-bold text-red-600">{lowStock} Items</div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8b8175]">Total Views</CardTitle>
            <Eye className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-nav-style font-bold text-blue-600">{totalViews}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8b8175]">Wishlist Saves</CardTitle>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-nav-style font-bold text-orange-600">{totalSaves}</div>
          </CardContent>
        </Card>
      </div>

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12 text-[#8b8175]">Loading Catalog Ecosystem...</div>
      ) : (
        <CatalogGrid items={catalogItems} />
      )}
      
      <AdminUploadStudio 
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
