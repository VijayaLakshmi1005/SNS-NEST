import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore } from '../store/themeStore'
import { UploadCloud, Wand2, ArrowRight, Image as ImageIcon, Sparkles, SlidersHorizontal } from 'lucide-react'

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

export default function AiRoom() {
  const { isNight } = useThemeStore()
  const theme = isNight ? THEME.dark : THEME.light
  
  const [step, setStep] = useState(1) // 1: Upload, 2: Generating, 3: Result
  const [sliderPos, setSliderPos] = useState(50)

  const handleUpload = () => {
    setStep(2)
    setTimeout(() => setStep(3), 3000)
  }

  return (
    <div className="w-full h-full pb-20 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className={`text-3xl lg:text-5xl font-extrabold tracking-tight ${theme.text} mb-4 font-nav-style flex items-center justify-center gap-3`}>
          AI Visualizer <Sparkles className="w-8 h-8 text-yellow-500" />
        </h1>
        <p className={`text-sm lg:text-base ${theme.textMuted} max-w-xl mx-auto`}>
          Upload a photo of your empty room and let our AI transform it into a luxury scandinavian space instantly.
        </p>
      </div>

      <AnimatePresence mode="wait">
        
        {step === 1 && (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className={`w-full aspect-4/3 sm:aspect-21/9 rounded-3xl border-2 border-dashed ${theme.cardInner} flex flex-col items-center justify-center p-8 group cursor-pointer hover:border-current transition-colors`}
            onClick={handleUpload}
          >
            <div className={`w-20 h-20 rounded-full ${theme.card} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <UploadCloud className={`w-10 h-10 ${theme.text}`} />
            </div>
            <h3 className={`text-xl font-bold ${theme.text} mb-2`}>Drop your room photo here</h3>
            <p className={`text-sm ${theme.textMuted} mb-6`}>Supports JPG, PNG (Max 10MB)</p>
            <button className={`px-8 py-3 rounded-xl font-bold text-sm tracking-wide transition-all ${isNight ? 'bg-[#F5EBE0] text-[#1E1A17]' : 'bg-[#1E1A17] text-[#F5EBE0]'}`}>
              Browse Files
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full aspect-21/9 rounded-3xl flex flex-col items-center justify-center"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className={`w-16 h-16 border-4 border-t-transparent ${isNight ? 'border-[#F5EBE0]' : 'border-[#1E1A17]'} rounded-full mb-6`}
            />
            <h3 className={`text-xl font-bold ${theme.text} animate-pulse`}>Architecting your space...</h3>
            <p className={`text-sm ${theme.textMuted}`}>Applying scandinavian lighting & textures</p>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-8"
          >
            {/* Before / After Slider */}
            <div className="relative w-full aspect-4/3 lg:aspect-21/9 rounded-3xl overflow-hidden group select-none">
              
              {/* After Image (AI Generated) */}
              <img 
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1600" 
                alt="AI Generated Room"
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
              
              {/* Before Image (Original) */}
              <div 
                className="absolute inset-0 overflow-hidden border-r-2 border-white"
                style={{ width: `${sliderPos}%` }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1600" 
                  alt="Original Room"
                  className="absolute inset-0 w-screen max-w-[5xl] h-full object-cover grayscale opacity-80"
                  style={{ width: '100%', maxWidth: 'none' }} // to prevent image squishing
                  draggable={false}
                />
              </div>
              
              {/* Slider Handle */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize flex items-center justify-center -ml-0.5"
                style={{ left: `${sliderPos}%` }}
                onPointerMove={(e) => {
                  if (e.buttons === 1) {
                    const rect = e.currentTarget.parentElement.getBoundingClientRect()
                    const pos = ((e.clientX - rect.left) / rect.width) * 100
                    setSliderPos(Math.min(Math.max(pos, 0), 100))
                  }
                }}
              >
                <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4 text-black" />
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-6 left-6 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-white text-xs font-bold tracking-widest uppercase z-10">Before</div>
              <div className="absolute top-6 right-6 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-white text-xs font-bold tracking-widest uppercase z-10">After</div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={() => setStep(1)} className={`px-6 py-3 rounded-xl font-bold text-sm border ${theme.cardInner} ${theme.textMuted} hover:opacity-80 transition-opacity`}>
                Start Over
              </button>
              <button className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${isNight ? 'bg-[#F5EBE0] text-[#1E1A17]' : 'bg-[#1E1A17] text-[#F5EBE0]'}`}>
                Save Design
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
