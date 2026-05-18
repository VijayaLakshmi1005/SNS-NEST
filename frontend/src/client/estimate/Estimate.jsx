import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useThemeStore } from '../store/themeStore'
import { Calculator, Download, ChevronRight, CheckCircle2 } from 'lucide-react'

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

export default function Estimate() {
  const { isNight } = useThemeStore()
  const theme = isNight ? THEME.dark : THEME.light
  
  const [size, setSize] = useState(1500)
  const [quality, setQuality] = useState('premium') // essential, premium, luxury

  const basePrice = { essential: 3500, premium: 6000, luxury: 12000 }[quality]
  const total = size * basePrice
  const tax = total * 0.18
  const grandTotal = total + tax

  return (
    <div className="w-full h-full pb-20 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className={`text-3xl lg:text-5xl font-extrabold tracking-tight ${theme.text} mb-4 font-nav-style`}>
          Cost Estimator
        </h1>
        <p className={`text-sm lg:text-base ${theme.textMuted}`}>
          Transparent, dynamic pricing for your interior design project.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Controls */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className={`p-8 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md`}>
            <h3 className={`text-xl font-bold ${theme.text} mb-6`}>Property Details</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-4">
                  <label className={`text-xs uppercase tracking-widest font-semibold ${theme.textMuted}`}>Area (Sq.Ft)</label>
                  <span className={`text-2xl font-light ${theme.text}`}>{size.toLocaleString('en-IN')} sqft</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="5000" 
                  step="50"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-black dark:accent-white"
                />
              </div>

              <div className="pt-6 border-t border-black/10 dark:border-white/10">
                <label className={`text-xs uppercase tracking-widest font-semibold ${theme.textMuted} block mb-4`}>Material Quality</label>
                <div className="grid grid-cols-3 gap-4">
                  {['essential', 'premium', 'luxury'].map(q => (
                    <div 
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${
                        quality === q 
                          ? `border-${isNight ? 'white' : 'black'} ${isNight ? 'bg-[#3A312B]' : 'bg-[#E3D5CA]'}` 
                          : `${theme.cardInner} hover:scale-105`
                      }`}
                    >
                      <h4 className={`text-sm font-bold capitalize mb-1 ${theme.text}`}>{q}</h4>
                      <p className={`text-[10px] uppercase tracking-wider ${theme.textMuted}`}>
                        ₹{q === 'essential' ? '3,500' : q === 'premium' ? '6,000' : '12,000'}/sqft
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Breakdown */}
        <div className="lg:col-span-5">
          <div className={`sticky top-8 p-8 rounded-3xl border ${isNight ? 'bg-[#1E1A17] border-[#3A312B]' : 'bg-[#1E1A17] border-[#2B2B2B]'} shadow-2xl`}>
            
            <div className="flex items-center gap-3 mb-8">
              <Calculator className="w-6 h-6 text-[#F5EBE0]" />
              <h3 className="text-xl font-bold text-[#F5EBE0]">Estimate</h3>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-[#E3D5CA]/70 text-sm">
                <span>Civil Work (30%)</span>
                <span>₹{(total * 0.3).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#E3D5CA]/70 text-sm">
                <span>Woodwork (40%)</span>
                <span>₹{(total * 0.4).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#E3D5CA]/70 text-sm">
                <span>Decor & Lighting (30%)</span>
                <span>₹{(total * 0.3).toLocaleString('en-IN')}</span>
              </div>
              <div className="h-px bg-[#F5EBE0]/10 my-4" />
              <div className="flex justify-between text-[#E3D5CA] text-sm">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#E3D5CA]/70 text-sm">
                <span>Taxes (18%)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5EBE0]/10 backdrop-blur-md mb-8">
              <span className="text-[#E3D5CA]/70 text-xs uppercase tracking-widest font-semibold block mb-2">Total Estimated Cost</span>
              <div className="text-4xl font-light text-[#F5EBE0]">
                ₹{grandTotal.toLocaleString('en-IN')}
              </div>
            </div>

            <button className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold tracking-wide transition-all bg-[#F5EBE0] text-[#1E1A17] hover:bg-white`}>
              <Download className="w-4 h-4" /> Download PDF Quote
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
