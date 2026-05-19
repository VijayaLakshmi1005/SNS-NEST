import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore } from '../store/themeStore'
import { apiRequest } from '../utils/api'
import { 
  UploadCloud, 
  Wand2, 
  Sparkles, 
  SlidersHorizontal, 
  Download, 
  Share2, 
  History, 
  Trash2, 
  Copy, 
  Check, 
  Loader2,
  ChevronRight,
  Info,
  Maximize2,
  X
} from 'lucide-react'

const THEME = {
  light: {
    card: 'bg-[#E3D5CA]/50 border-[#D6CCC2]/40',
    cardInner: 'bg-[#F5EBE0]/80 border-[#D6CCC2]/20',
    text: 'text-[#2B2B2B]',
    textMuted: 'text-[#4A4340]',
    accent: 'bg-[#C9B7A7]/50 text-[#2B2B2B]',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
    activeCard: 'border-[#2B2B2B] bg-[#E3D5CA]',
  },
  dark: {
    card: 'bg-[#2A241F]/60 border-[#3A312B]',
    cardInner: 'bg-[#1E1A17]/80 border-[#3A312B]',
    text: 'text-[#F5EBE0]',
    textMuted: 'text-[#E3D5CA]/70',
    accent: 'bg-[#3A312B] text-[#F5EBE0]',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.4)]',
    activeCard: 'border-[#F5EBE0] bg-[#3A312B]',
  }
}

const STYLES = [
  { name: 'Scandinavian', img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=120&h=120' },
  { name: 'Modern Luxury', img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=120&h=120' },
  { name: 'Minimal', img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=120&h=120' },
  { name: 'Contemporary', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=120&h=120' },
  { name: 'Japandi', img: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=120&h=120' },
  { name: 'Industrial', img: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=120&h=120' },
  { name: 'Warm Neutral', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=120&h=120' },
  { name: 'Classic Luxury', img: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=120&h=120' },
]

const WALL_COLORS = [
  { name: 'Warm Beige', code: '#E6DFD5' },
  { name: 'Ivory Cream', code: '#F6F3EC' },
  { name: 'Sage Green', code: '#AAB5A2' },
  { name: 'Dusty Rose', code: '#D9C5C1' },
  { name: 'Muted Grey', code: '#C4C4C2' }
]

const FLOORING_TYPES = ['Light Oak Wood', 'Dark Walnut Wood', 'Polished White Marble', 'Beige Terrazzo', 'Neutral Slate Tiles']
const LIGHTING_TYPES = ['Warm Ambient Lighting', 'Natural Daylight', 'Dimmable Ceiling Spots', 'Pendant Chandelier']

export default function AiRoom() {
  const { isNight } = useThemeStore()
  const theme = isNight ? THEME.dark : THEME.light

  // Workspace States
  const [originalImage, setOriginalImage] = useState('')
  const [generatedImage, setGeneratedImage] = useState('')
  const [sliderPos, setSliderPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Options State
  const [selectedStyle, setSelectedStyle] = useState('Scandinavian')
  const [selectedRoomType, setSelectedRoomType] = useState('Living Room')
  const [selectedWallColor, setSelectedWallColor] = useState('Warm Beige')
  const [selectedFlooring, setSelectedFlooring] = useState('Light Oak Wood')
  const [selectedLighting, setSelectedLighting] = useState('Natural Daylight')

  // History State
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  // Feedback State
  const [shareCopied, setShareCopied] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const fileInputRef = useRef(null)
  const workspaceRef = useRef(null)

  // Fetch History on Mount
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true)
      const res = await apiRequest('/ai/history')
      setHistory(res.data || [])
    } catch (error) {
      console.error('Error fetching generation history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  // Handle Drag & Drop / Upload
  const handleFileUpload = async (file) => {
    if (!file) return
    // Simple validation
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Supported formats: JPG, PNG, WEBP')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Max file size is 10MB')
      return
    }

    try {
      setUploadProgress(10)
      const formData = new FormData()
      formData.append('image', file)

      // Upload file to get Cloudinary secure URL
      setUploadProgress(40)
      const res = await apiRequest('/ai/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadProgress(100)
      setOriginalImage(res.data.originalImage)
      setGeneratedImage('')
    } catch (error) {
      console.error('Error uploading original image:', error)
      alert('Image upload failed. Please try again.')
    } finally {
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  // Trigger Generation
  const handleGenerate = async () => {
    if (!originalImage) return
    try {
      setIsGenerating(true)
      
      const res = await apiRequest('/ai/generate', {
        method: 'POST',
        data: {
          originalImageUrl: originalImage,
          style: selectedStyle,
          roomType: selectedRoomType,
          wallColor: selectedWallColor,
          flooringType: selectedFlooring,
          lightingType: selectedLighting
        }
      });

      setGeneratedImage(res.data.generatedImage)
      fetchHistory() // Refresh History list
    } catch (error) {
      console.error('AI generation error:', error)
      alert('Generation request failed. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Delete Generation Session
  const handleDeleteHistory = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this rendering session from your history?')) return
    try {
      await apiRequest(`/ai/${id}`, { method: 'DELETE' });
      // If active session is deleted, clear workspace
      setHistory(prev => prev.filter(item => item._id !== id))
    } catch (error) {
      console.error('Error deleting design session:', error)
    }
  }

  const handleLoadPastDesign = (session) => {
    setOriginalImage(session.originalImage)
    setGeneratedImage(session.generatedImage)
    setSelectedStyle(session.style)
    setSelectedRoomType(session.roomType)
    setSelectedWallColor(session.wallColor)
    setSelectedFlooring(session.flooringType)
    setSelectedLighting(session.lightingType)
  }

  // Drag comparison handler
  const handleMove = (clientX) => {
    if (!workspaceRef.current) return
    const rect = workspaceRef.current.getBoundingClientRect()
    const pos = ((clientX - rect.left) / rect.width) * 100
    setSliderPos(Math.min(Math.max(pos, 0), 100))
  }

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX)
    }
  }

  const handleMouseMove = (e) => {
    if (e.buttons === 1 || isDragging) {
      handleMove(e.clientX)
    }
  }

  const handlePointerDown = () => setIsDragging(true)
  const handlePointerUp = () => setIsDragging(false)

  // Dynamic suggestions block
  const getSmartSuggestions = () => {
    switch (selectedStyle) {
      case 'Scandinavian':
        return 'We suggest pairing this layout with light oak wood floors and minimalist beige furniture elements. Emphasize warm natural daylight.'
      case 'Modern Luxury':
        return 'We suggest polished marble flooring, dark luxury walnut accents, and custom ambient pendant fixtures. Use brushed brass trims.'
      case 'Minimal':
        return 'Focus on raw open spacing. Use soft ivory tones, low-profile linen sofas, and a single accent lighting source.'
      case 'Contemporary':
        return 'Pairs well with large format neutral tiles, warm ambient dimmers, and custom modular sofas with textured cushions.'
      case 'Japandi':
        return 'Incorporate low-sitting bamboo furniture, warm sand wall colors, light flooring, and paper pendant lights.'
      case 'Industrial':
        return 'Emphasize exposed concrete patterns, dark metal accents, warm Edison-bulb lighting, and rough leather upholstery.'
      case 'Warm Neutral':
        return 'Create depth with subtle dusty cream shades, wool rugs, textured draperies, and dim warm spotlights.'
      case 'Classic Luxury':
        return 'Complement with rich herringbone flooring, structured beige paneling, and an ornamental glass chandelier.'
      default:
        return 'Matches best with natural wood floors and light-diffused curtains.'
    }
  }

  return (
    <div className="w-full h-full pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="mb-10 lg:mb-12">
        <h1 className={`text-3xl lg:text-4xl font-extrabold tracking-tight ${theme.text} mb-2 font-nav-style flex items-center gap-3`}>
          AI Room Visualizer <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
        </h1>
        <p className={`text-sm lg:text-base ${theme.textMuted} max-w-xl`}>
          Transform your empty spaces into high-end curated designs instantly using luxury styling presets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Workspace Viewport (Spans 7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Visualizer viewport */}
          <div className={`p-4 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md relative overflow-hidden`}>
            
            {!originalImage ? (
              // Initial Empty Upload State
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full aspect-4/3 rounded-2xl border-2 border-dashed ${theme.cardInner} flex flex-col items-center justify-center p-8 group cursor-pointer hover:border-[#C9B7A7] transition-all duration-300`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => handleFileUpload(e.target.files?.[0])}
                  className="hidden" 
                  accept="image/jpeg,image/png,image/webp" 
                />
                
                {uploadProgress > 0 ? (
                  <div className="text-center space-y-4">
                    <Loader2 className={`w-10 h-10 animate-spin mx-auto ${theme.textMuted}`} />
                    <div className="w-48 bg-black/10 dark:bg-white/10 h-1 rounded-full overflow-hidden mx-auto">
                      <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <span className={`text-xs ${theme.textMuted} font-bold`}>Uploading Original Space...</span>
                  </div>
                ) : (
                  <>
                    <div className={`w-16 h-16 rounded-full ${theme.card} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}>
                      <UploadCloud className={`w-8 h-8 ${theme.textMuted}`} />
                    </div>
                    <h3 className={`text-sm font-bold ${theme.text} mb-1`}>Drag and drop your room photo here</h3>
                    <p className={`text-[10px] ${theme.textMuted} mb-4`}>Supports JPG, PNG, WEBP (Max 10MB)</p>
                    <button className={`px-6 py-2 rounded-xl font-bold text-xs tracking-wide transition-all ${isNight ? 'bg-[#F5EBE0] text-[#1E1A17]' : 'bg-[#1E1A17] text-[#F5EBE0]'}`}>
                      Browse Files
                    </button>
                  </>
                )}
              </div>
            ) : isGenerating ? (
              // Generating AI View State
              <div className="w-full aspect-4/3 rounded-2xl flex flex-col items-center justify-center relative bg-black/5 dark:bg-white/5 overflow-hidden">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 opacity-20 pointer-events-none"
                >
                  <img src={originalImage} alt="source" className="w-full h-full object-cover filter blur-sm" />
                </motion.div>
                
                <div className="relative z-10 text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <Loader2 className={`w-16 h-16 animate-spin ${theme.text} opacity-20`} />
                    <Sparkles className="w-6 h-6 text-yellow-500 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${theme.text} tracking-wider uppercase`}>Generating your dream room...</h3>
                    <p className={`text-[11px] ${theme.textMuted} mt-1`}>Refining lighting, shadows & texture structures</p>
                  </div>
                </div>
              </div>
            ) : generatedImage ? (
              // Split comparison slider
              <div 
                ref={workspaceRef}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="relative w-full aspect-4/3 rounded-2xl overflow-hidden group select-none cursor-col-resize border border-black/5 dark:border-white/5"
              >
                {/* Generated Image (After) */}
                <img 
                  src={generatedImage} 
                  alt="AI Transformed Interior" 
                  className="absolute inset-0 w-full h-full object-cover" 
                  draggable={false} 
                />

                {/* Original Image (Before) */}
                <div 
                  className="absolute inset-0 overflow-hidden border-r border-white/60 z-10"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img 
                    src={originalImage} 
                    alt="Original Space" 
                    className="absolute inset-0 w-full h-full object-cover" 
                    style={{ width: workspaceRef.current?.getBoundingClientRect().width, maxWidth: 'none' }}
                    draggable={false}
                  />
                </div>

                {/* Handle bar */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white z-20 cursor-col-resize"
                  style={{ left: `${sliderPos}%` }}
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp}
                >
                  <div className="w-8 h-8 bg-white text-black rounded-full shadow-lg border border-black/5 flex items-center justify-center absolute top-1/2 -translate-y-1/2 -left-3.5 hover:scale-105 active:scale-95 transition-all">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Badges */}
                <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-[9px] font-bold text-white px-2.5 py-0.5 rounded-full tracking-widest uppercase z-30 pointer-events-none">Before</span>
                <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-[9px] font-bold text-white px-2.5 py-0.5 rounded-full tracking-widest uppercase z-30 pointer-events-none">AI After</span>
              </div>
            ) : (
              // Uploaded source showing, waiting for generation trigger
              <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden border border-black/5 dark:border-white/5">
                <img src={originalImage} alt="Uploaded Original Room" className="w-full h-full object-cover" />
                <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-[9px] font-bold text-white px-2.5 py-0.5 rounded-full tracking-widest uppercase">Uploaded Space</span>
                
                <button 
                  onClick={() => setOriginalImage('')}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors"
                  title="Remove Image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Actions for generated view */}
            {generatedImage && !isGenerating && (
              <div className="flex gap-2 justify-end mt-4">
                <button 
                  onClick={() => window.open(generatedImage, '_blank')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border ${theme.cardInner} ${theme.text} hover:scale-[1.02] transition-transform`}
                  title="Download render"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button 
                  onClick={() => setShowShareModal(true)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border ${theme.cardInner} ${theme.text} hover:scale-[1.02] transition-transform`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
                <button 
                  onClick={() => {
                    setGeneratedImage('')
                    setOriginalImage('')
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border ${theme.cardInner} ${theme.textMuted} hover:scale-[1.02] transition-transform`}
                >
                  Clear Workspace
                </button>
              </div>
            )}
          </div>

          {/* AI Smart Suggestions Panel */}
          {originalImage && (
            <div className={`p-5 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md flex gap-4 items-start`}>
              <div className={`p-3 rounded-2xl bg-black/5 dark:bg-white/5 ${theme.text} shrink-0`}>
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${theme.text}`}>AI Design Suggestion</h4>
                <p className={`text-xs ${theme.textMuted} leading-relaxed`}>
                  {getSmartSuggestions()}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: AI Customizer Settings Panel (Spans 5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`p-6 lg:p-8 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md space-y-6`}>
            
            <div>
              <h3 className={`text-lg font-bold ${theme.text}`}>Aesthetic Presets</h3>
              <p className={`text-xs ${theme.textMuted} mt-1`}>Choose style parameters to guide the AI visualizer.</p>
            </div>

            {/* Room Type Selector */}
            <div className="space-y-2">
              <label className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMuted}`}>1. Room Workspace Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['Living Room', 'Bedroom', 'Kitchen', 'Workspace Studio'].map((room) => (
                  <button
                    key={room}
                    onClick={() => setSelectedRoomType(room)}
                    className={`py-2 px-3 text-xs font-bold border rounded-xl transition-all ${
                      selectedRoomType === room 
                        ? theme.activeCard 
                        : `${theme.cardInner} hover:bg-black/5 dark:hover:bg-white/5`
                    }`}
                  >
                    {room}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selection Grid with Visual Thumbnails */}
            <div className="space-y-2">
              <label className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMuted}`}>2. Interior Style Blueprint</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((style) => (
                  <div
                    key={style.name}
                    onClick={() => setSelectedStyle(style.name)}
                    className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      selectedStyle === style.name 
                        ? theme.activeCard 
                        : `${theme.cardInner} hover:scale-[1.01]`
                    }`}
                  >
                    <img src={style.img} alt={style.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    <span className="text-[11px] font-bold truncate">{style.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Wall Color Transform Swatches */}
            <div className="space-y-2">
              <label className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMuted}`}>3. Wall Color Palette</label>
              <div className="flex flex-wrap gap-2.5">
                {WALL_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedWallColor(color.name)}
                    className={`w-8 h-8 rounded-full border relative flex items-center justify-center transition-all ${
                      selectedWallColor === color.name ? 'scale-110 shadow-md border-black dark:border-white' : 'border-black/10 dark:border-white/10'
                    }`}
                    style={{ backgroundColor: color.code }}
                    title={color.name}
                  >
                    {selectedWallColor === color.name && (
                      <Check className="w-3.5 h-3.5 text-white filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Flooring Selector */}
            <div className="space-y-2">
              <label className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMuted}`}>4. Flooring Texture</label>
              <div className="flex flex-wrap gap-2">
                {FLOORING_TYPES.map((floor) => (
                  <button
                    key={floor}
                    onClick={() => setSelectedFlooring(floor)}
                    className={`py-1.5 px-3 text-[10px] font-semibold border rounded-lg transition-all ${
                      selectedFlooring === floor 
                        ? theme.activeCard 
                        : `${theme.cardInner} hover:bg-black/5 dark:hover:bg-white/5`
                    }`}
                  >
                    {floor}
                  </button>
                ))}
              </div>
            </div>

            {/* Lighting Selector */}
            <div className="space-y-2">
              <label className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMuted}`}>5. Ambient Lighting Setup</label>
              <div className="flex flex-wrap gap-2">
                {LIGHTING_TYPES.map((light) => (
                  <button
                    key={light}
                    onClick={() => setSelectedLighting(light)}
                    className={`py-1.5 px-3 text-[10px] font-semibold border rounded-lg transition-all ${
                      selectedLighting === light 
                        ? theme.activeCard 
                        : `${theme.cardInner} hover:bg-black/5 dark:hover:bg-white/5`
                    }`}
                  >
                    {light}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Trigger Button */}
            <button
              onClick={handleGenerate}
              disabled={!originalImage || isGenerating}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${
                !originalImage || isGenerating 
                  ? 'opacity-40 cursor-not-allowed bg-black/10 dark:bg-white/10' 
                  : isNight ? 'bg-[#F5EBE0] text-[#1E1A17] hover:bg-white' : 'bg-[#1E1A17] text-[#F5EBE0] hover:bg-black'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              <span>Generate Design</span>
            </button>

          </div>
        </div>

      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* AI GENERATED HISTORY SECTION        */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="mt-12 space-y-6">
        <h3 className={`text-xl font-bold ${theme.text} flex items-center gap-2`}>
          <History className="w-5 h-5 opacity-70" /> Render Generation History
        </h3>

        {loadingHistory ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className={`w-8 h-8 animate-spin ${theme.textMuted}`} />
          </div>
        ) : history.length === 0 ? (
          <div className={`p-10 rounded-3xl border ${theme.card} text-center`}>
            <p className={`text-xs ${theme.textMuted}`}>Your generation archive is currently empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {history.map((item) => (
              <div 
                key={item._id}
                onClick={() => handleLoadPastDesign(item)}
                className={`group rounded-2xl overflow-hidden border ${theme.cardInner} cursor-pointer relative aspect-square transition-all duration-300 hover:scale-[1.01]`}
              >
                <img src={item.generatedImage} alt={item.style} className="w-full h-full object-cover" />
                
                {/* Hover overlay details */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3.5 z-10">
                  <button 
                    onClick={(e) => handleDeleteHistory(e, item._id)}
                    className="self-end p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    title="Delete generation session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div>
                    <h5 className="text-white text-xs font-bold">{item.style}</h5>
                    <p className="text-white/80 text-[10px]">{item.roomType}</p>
                    <span className="text-white/60 text-[9px] block mt-1">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share design modal */}
      <AnimatePresence>
        {showShareModal && generatedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full max-w-sm rounded-3xl p-6 border ${theme.card} ${theme.shadow} backdrop-blur-xl z-10 relative`}
            >
              <button 
                onClick={() => setShowShareModal(false)}
                className={`absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 ${theme.textMuted}`}
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className={`text-md font-bold ${theme.text} mb-4`}>Share Design Blueprint</h3>

              <div className="space-y-4">
                <div className={`p-3 rounded-xl border ${theme.cardInner} flex items-center justify-between gap-2`}>
                  <span className={`text-xs ${theme.textMuted} truncate flex-1`}>{generatedImage}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedImage)
                      setShareCopied(true)
                      setTimeout(() => setShareCopied(false), 2000)
                    }}
                    className={`p-2 rounded-lg ${theme.card} ${theme.text} hover:scale-105 transition-transform`}
                  >
                    {shareCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.open(`https://api.whatsapp.com/send?text=Check%20out%20my%20new%20interior%20design:%20${encodeURIComponent(generatedImage)}`, '_blank')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold text-center border ${theme.cardInner} hover:bg-black/5 transition-colors`}
                  >
                    WhatsApp
                  </button>
                  <button 
                    onClick={() => window.open(`mailto:?subject=New%20Design%20Inspiration&body=Check%20out%20this%20luxury%20design%20rendering:%20${encodeURIComponent(generatedImage)}`)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold text-center border ${theme.cardInner} hover:bg-black/5 transition-colors`}
                  >
                    Email Link
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
