import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, Edit, AlertTriangle, Layers, Maximize, Eye, Heart } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

const fetchProduct = async (id) => {
  const res = await axios.get(`${API_URL}/products/${id}`, { withCredentials: true, transports: ['websocket', 'polling'] });
  return res.data;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: queryData, isLoading, isError } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => fetchProduct(id)
  });

  if (isLoading) return <div className="h-full flex items-center justify-center text-[#8b8175]">Loading Product Ecosystem...</div>;
  if (isError || !queryData?.data) return <div className="h-full flex items-center justify-center text-red-500">Failed to load product.</div>;

  const product = queryData.data;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <button 
        onClick={() => navigate('/admin/products')}
        className="flex items-center gap-2 text-[#8b8175] hover:text-[#2d2a26] transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Media Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-3xl border border-[#e5e0d8] overflow-hidden flex items-center justify-center relative shadow-sm">
            {product.images && product.images.length > 0 ? (
              <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-[#8b8175] flex flex-col items-center">
                <Layers className="w-12 h-12 opacity-20 mb-2" />
                <span className="text-sm">No HD Media Available</span>
              </div>
            )}
            <button className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm hover:bg-white transition-colors">
              <Maximize className="w-5 h-5 text-[#2d2a26]" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {/* Thumbnails placeholder */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-[#fcfbf9] rounded-xl border border-[#e5e0d8] cursor-pointer hover:border-[#2d2a26] transition-colors"></div>
            ))}
          </div>
        </div>

        {/* Right: Product Meta */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs uppercase font-bold tracking-widest text-[#8b8175] bg-[#fcfbf9] px-2 py-1 rounded-md border border-[#e5e0d8]">
                {product.category?.name || 'Uncategorized'}
              </span>
              <span className="text-xs font-bold text-[#8b8175] bg-[#fcfbf9] px-2 py-1 rounded-md border border-[#e5e0d8]">
                SKU: {product.sku}
              </span>
            </div>
            <h1 className="font-nav-style text-4xl font-extrabold text-[#2d2a26] mb-2">{product.name}</h1>
            <p className="text-2xl font-light text-[#2d2a26] mb-4">₹{product.basePrice.toLocaleString()}</p>
            <p className="text-sm text-[#8b8175] leading-relaxed">
              {product.description || "A luxury piece crafted for minimalist elegance. Seamlessly integrates with Scandinavian and modern interiors."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white border-[#e5e0d8] shadow-none">
              <CardContent className="p-4">
                <p className="text-xs text-[#8b8175] mb-1">Inventory Status</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2d2a26]">{product.inventory.inStock} Units</span>
                  {product.inventory.inStock <= product.inventory.lowStockThreshold && (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-[#e5e0d8] shadow-none">
              <CardContent className="p-4">
                <p className="text-xs text-[#8b8175] mb-1">Total Views</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2d2a26]">{product.stats?.views || 0}</span>
                  <Eye className="w-4 h-4 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 pt-6 border-t border-[#e5e0d8]">
            <h3 className="font-bold text-[#2d2a26]">Specifications</h3>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div className="text-[#8b8175]">Dimensions</div>
              <div className="font-medium text-[#2d2a26]">
                {product.dimensions?.length || '0'}x{product.dimensions?.width || '0'}x{product.dimensions?.height || '0'} {product.dimensions?.unit || 'mm'}
              </div>
              <div className="text-[#8b8175]">Materials</div>
              <div className="font-medium text-[#2d2a26]">{product.materials?.join(', ') || 'Premium Blend'}</div>
              <div className="text-[#8b8175]">Style</div>
              <div className="font-medium text-[#2d2a26]">{product.style || 'Scandinavian'}</div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button className="flex-1 bg-[#2d2a26] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1a1816] transition-colors">
              <Edit className="w-4 h-4" /> Edit Details
            </button>
            <button className="px-6 border border-[#e5e0d8] text-[#2d2a26] rounded-xl hover:bg-[#fcfbf9] transition-colors flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
