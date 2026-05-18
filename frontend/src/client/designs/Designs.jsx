import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore } from '../store/themeStore'
import { Search, Filter, Heart, Eye } from 'lucide-react'

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

const DESIGNS = [
  { id: 1, title: 'Nordic Minimalist Living', style: 'Scandinavian', type: 'Living Room', height: 'h-96', img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800' },
  { id: 2, title: 'Warm Industrial Kitchen', style: 'Industrial', type: 'Kitchen', height: 'h-72', img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800' },
  { id: 3, title: 'Japandi Zen Bedroom', style: 'Japandi', type: 'Bedroom', height: 'h-80', img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=800' },
  { id: 4, title: 'Luxury Modern Bathroom', style: 'Modern', type: 'Bathroom', height: 'h-96', img: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=800' },
  { id: 5, title: 'Editorial Home Office', style: 'Contemporary', type: 'Office', height: 'h-72', img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800' },
  { id: 6, title: 'Earth Toned Dining', style: 'Bohemian', type: 'Dining', height: 'h-80', img: 'https://images.unsplash.com/photo-1617806118233-18e1c0945594?auto=format&fit=crop&q=80&w=800' },
]

const CATEGORIES = ['All', 'Scandinavian', 'Japandi', 'Modern', 'Industrial', 'Minimalist']

export default function Designs() {
  const { isNight } = useThemeStore()
  const theme = isNight ? THEME.dark : THEME.light
  const [activeCategory, setActiveCategory] = useState('All')

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
              placeholder="Search styles..." 
              className={`w-full bg-transparent py-2.5 pl-10 pr-4 outline-none text-sm ${theme.text} placeholder:${theme.textMuted}`}
            />
          </div>
          <button className={`p-2.5 rounded-full border ${theme.cardInner} ${theme.card} backdrop-blur-md ${theme.hover} transition-colors`}>
            <Filter className={`w-4 h-4 ${theme.textMuted}`} />
          </button>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex overflow-x-auto pb-4 mb-8 gap-3 scrollbar-hide">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-6 py-2 rounded-full whitespace-nowrap text-sm tracking-wide font-medium transition-all duration-300 ${
              activeCategory === category 
                ? `${isNight ? 'bg-[#F5EBE0] text-[#1E1A17]' : 'bg-[#1E1A17] text-[#F5EBE0]'} shadow-lg scale-105` 
                : `${theme.cardInner} border ${theme.card} ${theme.textMuted} hover:scale-105`
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Masonry Grid Simulation (Using CSS Columns for simple masonry) */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {DESIGNS.map((design, i) => (
          <motion.div
            key={design.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative group rounded-3xl overflow-hidden break-inside-avoid ${theme.shadow}`}
          >
            <div className={`w-full ${design.height} bg-black/10 relative overflow-hidden`}>
              <img 
                src={design.img} 
                alt={design.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              
              {/* Overlay Content */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-white font-bold text-lg mb-1">{design.title}</h3>
                  <div className="flex items-center gap-3 text-white/80 text-xs uppercase tracking-wider mb-4">
                    <span>{design.style}</span>
                    <span className="w-1 h-1 rounded-full bg-white/50"></span>
                    <span>{design.type}</span>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" /> Preview
                    </button>
                    <button className="w-11 h-11 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white rounded-xl flex items-center justify-center transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
    </div>
  )
}
