import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, Box } from 'lucide-react';

export default function ProductCatalog({ products = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || product.category?.name === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/80 p-4 rounded-2xl border border-[#e5e0d8] shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8175]" />
          <input 
            type="text" 
            placeholder="Search catalog..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl focus:outline-none focus:border-[#2d2a26] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#8b8175]" />
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl px-4 py-2 focus:outline-none focus:border-[#2d2a26] text-sm text-[#2d2a26]"
          >
            <option value="All">All Categories</option>
            <option value="Sofas">Sofas</option>
            <option value="Beds">Beds</option>
            <option value="Lighting">Lighting</option>
            <option value="Decor">Decor</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-24 text-[#8b8175] bg-white rounded-2xl border border-[#e5e0d8]">
          <Box className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No products found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link key={product._id} to={`/admin/products/${product._id}`}>
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-[#e5e0d8] overflow-hidden shadow-sm hover:shadow-md transition-all group"
              >
                <div className="aspect-[4/3] bg-[#fcfbf9] relative overflow-hidden flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0].url} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Box className="w-12 h-12 text-[#8b8175] opacity-20" />
                  )}
                  {product.inventory.status === 'Low Stock' && (
                    <div className="absolute top-2 right-2 bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-full">
                      Low Stock
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8b8175]">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                    <span className="text-xs font-medium text-[#2d2a26]">
                      ₹{product.basePrice.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="font-nav-style font-bold text-[#2d2a26] truncate">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-3 text-xs text-[#8b8175]">
                    <span className={`w-2 h-2 rounded-full ${
                      product.inventory.inStock > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    {product.inventory.inStock} Available
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
