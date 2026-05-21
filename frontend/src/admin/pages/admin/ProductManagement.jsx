import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Package, TrendingUp, AlertTriangle, Eye, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import ProductCatalog from '../../components/products/ProductCatalog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const fetchProducts = async () => {
  const res = await axios.get(`${API_URL}/products`, { withCredentials: true });
  return res.data;
};

export default function ProductManagement() {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const { data: productsQuery, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: fetchProducts,
    refetchInterval: 5000 // Real-time fallback
  });

  const products = productsQuery?.data || [];

  const total = products.length;
  const lowStock = products.filter(p => p.inventory.status === 'Low Stock' || p.inventory.status === 'Out of Stock').length;
  const totalViews = products.reduce((sum, p) => sum + (p.stats?.views || 0), 0);
  const totalSaves = products.reduce((sum, p) => sum + (p.stats?.wishlistSaves || 0), 0);

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

      {/* Product Catalog Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12 text-[#8b8175]">Loading Catalog...</div>
      ) : (
        <ProductCatalog products={products} />
      )}
      
    </div>
  );
}
