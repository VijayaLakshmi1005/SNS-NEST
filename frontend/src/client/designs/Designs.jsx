import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore } from '../store/themeStore'
import { Search, Heart, Eye, X } from 'lucide-react'
import axios from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api'

const THEME = {
  light: {
    card: 'bg-[#E3D5CA]/50 border-[#D6CCC2]/40',
    cardInner: 'bg-[#F5EBE0]/80 border-[#D6CCC2]/20',
    text: 'text-[#2B2B2B]',
    textMuted: 'text-[#4A4340]',
    accent: 'bg-[#C9B7A7]/50 text-[#2B2B2B]',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
  },
  dark: {
    card: 'bg-[#2A241F]/60 border-[#3A312B]',
    cardInner: 'bg-[#1E1A17]/80 border-[#3A312B]',
    text: 'text-[#F5EBE0]',
    textMuted: 'text-[#E3D5CA]/70',
    accent: 'bg-[#3A312B] text-[#F5EBE0]',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.4)]',
  }
}

const CATEGORIES = ['All', 'Minimal', 'Vintage', 'Modern', 'Furniture', 'Decor', 'Lighting', 'Interior Design']
const TYPES = [
  'All',
  'Residential Interior Design', 'Living Room Design', 'Bedroom Design', 
  'Modular Kitchen Design', 'Wardrobe Design', 'False Ceiling Design', 
  'TV Unit Design', 'Space Planning',
  'Commercial Interior Design', 'Office Interiors', 'Retail Shop Interiors', 
  'Showroom Design', 'Reception Area Design'
]
const TIERS = ['All', 'Basic', 'Standard', 'Premium', 'Luxury']

export default function Designs() {
  const { isNight } = useThemeStore()
  const theme = isNight ? THEME.dark : THEME.light
  const queryClient = useQueryClient()
  
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeType, setActiveType] = useState('All')
  const [activeTier, setActiveTier] = useState('All')
  const [activeFormat, setActiveFormat] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDesign, setSelectedDesign] = useState(null)

  // Fetch catalog items
  const { data: response, isLoading } = useQuery({
    queryKey: ['client-catalog', activeCategory, activeType, activeTier, searchTerm, activeFormat],
    queryFn: async () => {
      let url = `${API_URL}/catalog?`
      if (activeCategory !== 'All') url += `category=${activeCategory}&`
      if (activeType !== 'All') url += `type=${activeType}&`
      if (activeTier !== 'All') url += `tier=${activeTier}&`
      if (activeFormat !== 'All') url += `format=${activeFormat}&`
      if (searchTerm) url += `search=${searchTerm}&`
      
      const res = await axios.get(url, { withCredentials: true })
      return res.data
    }
  })

  // Fetch user wishlist
  const { data: wishlistRes } = useQuery({
    queryKey: ['my-wishlist'],
    queryFn: async () => {
      try {
        const res = await axios.get(`${API_URL}/catalog/wishlist/me`, { withCredentials: true })
        return res.data.data
      } catch (err) {
        return []
      }
    }
  })
  
  const savedIds = wishlistRes || []

  // Toggle wishlist mutation
  const toggleWishlistMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axios.post(`${API_URL}/catalog/${id}/wishlist`, {}, { withCredentials: true })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['client-catalog'])
      queryClient.invalidateQueries(['my-wishlist'])
    },
    onError: (err) => {
      if (err.response?.status === 401) {
        alert('Please log in to save designs to your wishlist.')
      } else {
        alert(err.response?.data?.message || 'Failed to update wishlist')
      }
    }
  })

  const designs = Array.isArray(response?.data) ? response.data : []

  return (
    <div className="w-full h-full pb-20">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className={`text-3xl lg:text-4xl font-extrabold tracking-tight ${theme.text} mb-2 font-nav-style`}>
            Design Exploration
          </h1>
          <p className={`text-sm lg:text-base ${theme.textMuted}`}>
            Curated luxury spaces to inspire your next project.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className={`relative flex items-center w-full md:w-64 rounded-full border ${theme.cardInner} ${theme.card} backdrop-blur-md overflow-hidden`}>
            <Search className={`w-4 h-4 absolute left-4 ${theme.textMuted}`} />
            <input 
              type="text" 
              placeholder="Search styles or types..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-transparent py-2.5 pl-10 pr-4 outline-none text-sm ${theme.text} placeholder:${theme.textMuted}`}
            />
          </div>
        </div>
      </div>

      {/* Format Type Toggle */}
      <div className="flex overflow-x-auto pb-4 mb-4 scrollbar-hide">
        <div className={`flex items-center p-1.5 rounded-xl border ${theme.cardInner} ${theme.card} w-max`}>
          {['All', 'Service', 'Product', 'Concept', 'Package'].map(format => (
            <button
              key={format}
              onClick={() => setActiveFormat(format)}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
                activeFormat === format 
                  ? 'bg-[#2d2a26] text-white shadow-sm' 
                  : `${theme.textMuted} hover:text-[#2d2a26] dark:hover:text-white`
              }`}
            >
              {format}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        {/* Category Dropdown */}
        <div>
          <label className={`block text-xs font-semibold ${theme.textMuted} uppercase tracking-wider mb-2`}>Category</label>
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none cursor-pointer ${theme.cardInner} ${theme.card} ${theme.text} transition-colors`}
          >
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category === 'All' ? 'All Categories' : category}</option>
            ))}
          </select>
        </div>

        {/* Tier Dropdown */}
        <div>
          <label className={`block text-xs font-semibold ${theme.textMuted} uppercase tracking-wider mb-2`}>Tier</label>
          <select
            value={activeTier}
            onChange={(e) => setActiveTier(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none cursor-pointer ${theme.cardInner} ${theme.card} ${theme.text} transition-colors`}
          >
            {TIERS.map(tier => (
              <option key={tier} value={tier}>{tier === 'All' ? 'All Tiers' : tier}</option>
            ))}
          </select>
        </div>

        {/* Type Dropdown */}
        <div>
          <label className={`block text-xs font-semibold ${theme.textMuted} uppercase tracking-wider mb-2`}>Type</label>
          <select
            value={activeType}
            onChange={(e) => setActiveType(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none cursor-pointer ${theme.cardInner} ${theme.card} ${theme.text} transition-colors`}
          >
            {TYPES.map(type => (
              <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Masonry Grid Simulation */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        <AnimatePresence>
          {isLoading ? (
            <div className={`text-center py-10 w-full col-span-3 ${theme.textMuted}`}>Loading designs...</div>
          ) : designs.length === 0 ? (
            <div className={`text-center py-10 w-full col-span-3 ${theme.textMuted}`}>No designs found matching your criteria.</div>
          ) : (
            designs.map((design, i) => (
              <motion.div
                key={design._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: (i % 10) * 0.1 }}
                className={`relative group rounded-3xl overflow-hidden break-inside-avoid ${theme.shadow}`}
              >
                <div className={`w-full h-80 bg-black/10 relative overflow-hidden`}>
                  {design.images && design.images.length > 0 ? (
                    <img 
                      src={design.images[0].url} 
                      alt={design.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-[#f5f2eb] flex items-center justify-center text-[#8b8175]">
                      No Image
                    </div>
                  )}
                  
                  {/* Overlay Content */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{design.title}</h3>
                      <div className="flex items-center gap-3 text-white/80 text-xs uppercase tracking-wider mb-4">
                        <span>{design.category}</span>
                        <span className="w-1 h-1 rounded-full bg-white/50"></span>
                        <span className="truncate">{design.type}</span>
                        <span className="w-1 h-1 rounded-full bg-white/50"></span>
                        <span>{design.tier || 'Standard'}</span>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setSelectedDesign(design)}
                          className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" /> View
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleWishlistMutation.mutate(design._id)
                          }}
                          disabled={toggleWishlistMutation.isLoading}
                          className={`w-11 h-11 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 ${
                            savedIds.includes(design._id) ? 'bg-white text-[#2d2a26]' : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                        >
                          <Heart className={`w-4 h-4 transition-colors ${savedIds.includes(design._id) ? 'fill-[#2d2a26]' : 'hover:fill-white'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Design Details Modal */}
      <AnimatePresence>
        {selectedDesign && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl ${theme.cardInner} shadow-2xl flex flex-col md:flex-row`}
            >
              <button 
                onClick={() => setSelectedDesign(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Image Section */}
              <div className={`w-full md:w-3/5 h-64 md:h-[80vh] ${isNight ? 'bg-[#151210]' : 'bg-[#EBE3DC]'} flex items-center justify-center p-2`}>
                {selectedDesign.images && selectedDesign.images.length > 0 ? (
                  <img src={selectedDesign.images[0].url} alt={selectedDesign.title} className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${theme.textMuted}`}>No Image Available</div>
                )}
              </div>
              
              {/* Details Section */}
              <div className="w-full md:w-2/5 p-8 flex flex-col h-full overflow-y-auto">
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider mb-3">
                    {selectedDesign.type && <span className={`px-2 py-1 rounded ${theme.card} border border-black/5 ${theme.textMuted}`}>{selectedDesign.type}</span>}
                    {selectedDesign.category && <span className={`px-2 py-1 rounded ${theme.card} border border-black/5 ${theme.textMuted}`}>{selectedDesign.category}</span>}
                    <span className={`px-2 py-1 rounded bg-[#2D2A26] text-white`}>{selectedDesign.tier || 'Standard'}</span>
                  </div>
                  <h2 className={`text-2xl font-bold mb-2 font-nav-style ${theme.text}`}>{selectedDesign.title}</h2>
                </div>
                
                <div className="space-y-6 mb-8">
                  <div>
                    <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${theme.textMuted}`}>Description</h3>
                    <p className={`text-sm leading-relaxed ${theme.text}`}>{selectedDesign.description || "A beautiful curated space tailored to match your vision and lifestyle. No additional description provided."}</p>
                  </div>
                  <div>
                    <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${theme.textMuted}`}>Base Estimate</h3>
                    <p className={`text-2xl font-bold ${theme.text}`}>INR {selectedDesign.pricing?.basePrice?.toLocaleString() || "Custom Quote"}</p>
                  </div>
                  
                  {selectedDesign.styles && selectedDesign.styles.length > 0 && (
                    <div>
                      <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${theme.textMuted}`}>AI Extracted Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedDesign.styles.map((style, i) => (
                          <span key={i} className={`text-xs px-2 py-1 rounded-full border ${theme.textMuted} border-black/10`}>{style}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-auto pt-6 border-t border-black/5 flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      window.location.href = `/client/chat?designId=${selectedDesign._id}&title=${encodeURIComponent(selectedDesign.title)}`;
                    }}
                    className={`w-full py-3.5 rounded-xl bg-[#2D2A26] text-white flex items-center justify-center gap-2 text-sm font-semibold hover:bg-black transition-all`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Share & Discuss in Chat
                  </button>
                  <button 
                    onClick={() => {
                      toggleWishlistMutation.mutate(selectedDesign._id)
                    }}
                    disabled={toggleWishlistMutation.isLoading}
                    className={`w-full py-3.5 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-semibold transition-all disabled:opacity-50 ${
                      savedIds.includes(selectedDesign._id)
                        ? 'bg-[#2D2A26] border-[#2D2A26] text-white'
                        : 'border-[#2D2A26] hover:bg-black/5 text-[#2D2A26]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${savedIds.includes(selectedDesign._id) ? 'fill-white' : ''}`} /> 
                    {toggleWishlistMutation.isLoading ? 'Saving...' : savedIds.includes(selectedDesign._id) ? 'Saved to Wishlist' : 'Save to Wishlist'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  )
}
