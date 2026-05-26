import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Eye, Heart, ArrowUpRight } from 'lucide-react';
import CatalogItemDrawer from './CatalogItemDrawer';

export default function CatalogGrid({ items }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = items.filter(item => {
    if (filter !== 'All' && item.type !== filter) return false;
    const itemTitle = item.title || item.name || '';
    if (search && !itemTitle.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl p-1 w-full sm:w-auto">
          {['All', 'Service', 'Product', 'Concept', 'Package'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                filter === type ? 'bg-[#2d2a26] text-white shadow-sm' : 'text-[#8b8175] hover:text-[#2d2a26]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8175]" />
            <input 
              type="text" 
              placeholder="Search catalog..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:border-[#2d2a26] transition-colors"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-colors ${showFilters ? 'bg-[#2d2a26] text-white border-[#2d2a26]' : 'bg-[#fcfbf9] border-[#e5e0d8] text-[#2d2a26] hover:bg-[#eae5db]'}`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white border border-[#e5e0d8] rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-sm">
              <div>
                <label className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider mb-2 block">Category</label>
                <select className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:border-[#2d2a26]">
                  <option value="">All Categories</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Decor">Decor</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Interior Design">Interior Design</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider mb-2 block">Price Range</label>
                <select className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:border-[#2d2a26]">
                  <option value="">Any Price</option>
                  <option value="0-5000">Under INR 5,000</option>
                  <option value="5000-25000">INR 5,000 - 25,000</option>
                  <option value="25000+">Over INR 25,000</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider mb-2 block">Sort By</label>
                <select className="w-full px-3 py-2 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl text-sm focus:outline-none focus:border-[#2d2a26]">
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        <AnimatePresence>
          {filteredItems.map(item => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={item._id}
              className="break-inside-avoid relative group cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-sm bg-white border border-[#e5e0d8]">
                {item.images && item.images.length > 0 ? (
                  <img 
                    src={item.images[0].url} 
                    alt={item.title} 
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full aspect-[4/3] bg-[#f5f2eb] flex items-center justify-center text-[#8b8175]">
                    No Image
                  </div>
                )}
                
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-[#2d2a26] hover:bg-[#2d2a26] hover:text-white transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-[#2d2a26] hover:bg-[#2d2a26] hover:text-white transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-md text-[10px] font-bold text-[#2d2a26] uppercase tracking-wider shadow-sm">
                    {item.type}
                  </span>
                  {item.inventory?.status === 'Low Stock' && (
                    <span className="px-2.5 py-1 bg-red-100/90 backdrop-blur-md rounded-md text-[10px] font-bold text-red-700 uppercase tracking-wider shadow-sm">
                      Low Stock
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-3 px-1">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-nav-style font-bold text-[#2d2a26] text-sm line-clamp-1">{item.title || item.name || 'Untitled'}</h3>
                  <span className="font-sans font-medium text-[#8b8175] text-xs shrink-0">
                    {item.pricing?.currency} {item.pricing?.basePrice?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1 text-xs text-[#8b8175]">
                  <span className="truncate pr-4">{item.category}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {item.stats?.views || 0}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {item.stats?.wishlistSaves || 0}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <CatalogItemDrawer 
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />
    </div>
  );
}
