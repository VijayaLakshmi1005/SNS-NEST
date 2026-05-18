import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useThemeStore } from '../store/themeStore'
import { Calendar as CalendarIcon, Clock, User, Video, MapPin, CheckCircle2 } from 'lucide-react'

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

const DESIGNERS = [
  { id: 1, name: 'Sarah Jenkins', role: 'Lead Architect', rating: 4.9, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
  { id: 2, name: 'Michael Chen', role: 'Interior Designer', rating: 4.8, img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200' },
  { id: 3, name: 'Emma Watson', role: 'Lighting Specialist', rating: 5.0, img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200' },
]

export default function Booking() {
  const { isNight } = useThemeStore()
  const theme = isNight ? THEME.dark : THEME.light
  
  const [step, setStep] = useState(1) // 1: Type, 2: Designer, 3: Date/Time, 4: Confirm
  const [type, setType] = useState('video')
  const [designer, setDesigner] = useState(1)

  return (
    <div className="w-full h-full pb-20 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className={`text-3xl lg:text-5xl font-extrabold tracking-tight ${theme.text} mb-4 font-nav-style`}>
          Book Consultation
        </h1>
        <p className={`text-sm lg:text-base ${theme.textMuted}`}>
          Schedule a one-on-one session with our elite design experts.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between items-center mb-12 relative max-w-2xl mx-auto px-4">
        <div className="absolute top-1/2 left-4 right-4 h-[2px] bg-black/10 -z-10" />
        {[1, 2, 3, 4].map(s => (
          <div 
            key={s} 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-500 ${
              s <= step 
                ? (isNight ? 'bg-[#F5EBE0] text-[#1E1A17]' : 'bg-[#1E1A17] text-[#F5EBE0]')
                : `bg-[#E3D5CA]/20 ${theme.textMuted}`
            }`}
          >
            {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
          </div>
        ))}
      </div>

      <div className={`p-6 lg:p-10 rounded-4xl border ${theme.card} ${theme.shadow} backdrop-blur-xl`}>
        
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h3 className={`text-xl font-bold ${theme.text} mb-6`}>How would you like to meet?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => setType('video')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all ${type === 'video' ? theme.activeCard : `${theme.cardInner} hover:scale-[1.02]`}`}
              >
                <Video className={`w-8 h-8 mb-4 ${type === 'video' ? theme.text : theme.textMuted}`} />
                <h4 className={`font-bold ${theme.text} mb-2`}>Video Consultation</h4>
                <p className={`text-sm ${theme.textMuted}`}>Meet online via Zoom/Meet from anywhere in the world.</p>
              </div>
              <div 
                onClick={() => setType('studio')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all ${type === 'studio' ? theme.activeCard : `${theme.cardInner} hover:scale-[1.02]`}`}
              >
                <MapPin className={`w-8 h-8 mb-4 ${type === 'studio' ? theme.text : theme.textMuted}`} />
                <h4 className={`font-bold ${theme.text} mb-2`}>Studio Visit</h4>
                <p className={`text-sm ${theme.textMuted}`}>Visit our design studio for an immersive material review.</p>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h3 className={`text-xl font-bold ${theme.text} mb-6`}>Choose your designer</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DESIGNERS.map(d => (
                <div 
                  key={d.id}
                  onClick={() => setDesigner(d.id)}
                  className={`p-6 rounded-2xl border text-center cursor-pointer transition-all ${designer === d.id ? theme.activeCard : `${theme.cardInner} hover:scale-[1.02]`}`}
                >
                  <img src={d.img} alt={d.name} className="w-20 h-20 rounded-full mx-auto object-cover mb-4 shadow-lg" />
                  <h4 className={`font-bold ${theme.text}`}>{d.name}</h4>
                  <p className={`text-xs ${theme.textMuted} mb-2`}>{d.role}</p>
                  <div className={`text-xs font-semibold ${theme.textMuted}`}>⭐ {d.rating}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h3 className={`text-xl font-bold ${theme.text} mb-6`}>Select Date & Time</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Fake Calendar */}
              <div className={`p-6 rounded-2xl border ${theme.cardInner}`}>
                <div className="flex justify-between items-center mb-6">
                  <h4 className={`font-bold ${theme.text}`}>October 2026</h4>
                  <CalendarIcon className={`w-5 h-5 ${theme.textMuted}`} />
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} className={`font-bold ${theme.textMuted}`}>{d}</div>
                  ))}
                  {Array.from({length: 31}).map((_, i) => (
                    <div 
                      key={i} 
                      className={`p-2 rounded-full cursor-pointer hover:bg-black/10 ${i === 15 ? 'bg-black text-white dark:bg-white dark:text-black font-bold' : theme.text}`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Fake Time Slots */}
              <div className="space-y-4">
                <h4 className={`font-bold ${theme.text} mb-4`}>Available Slots</h4>
                {['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'].map((time, i) => (
                  <div 
                    key={time}
                    className={`p-4 rounded-xl border ${i === 1 ? theme.activeCard : theme.cardInner} flex items-center justify-between cursor-pointer`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4" />
                      <span className="font-bold">{time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
            <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${isNight ? 'bg-[#F5EBE0]' : 'bg-[#1E1A17]'}`}>
              <CheckCircle2 className={`w-12 h-12 ${isNight ? 'text-[#1E1A17]' : 'text-[#F5EBE0]'}`} />
            </div>
            <h3 className={`text-3xl font-extrabold ${theme.text} mb-4 font-nav-style`}>Booking Confirmed</h3>
            <p className={`text-sm ${theme.textMuted} max-w-sm mx-auto mb-8`}>
              Your video consultation with Sarah Jenkins is scheduled for Oct 16, 2026 at 11:30 AM.
            </p>
            <button 
              onClick={() => setStep(1)}
              className={`px-8 py-3 rounded-full font-bold text-sm tracking-wide transition-all ${isNight ? 'bg-[#F5EBE0] text-[#1E1A17]' : 'bg-[#1E1A17] text-[#F5EBE0]'}`}
            >
              Back to Dashboard
            </button>
          </motion.div>
        )}

        {/* Footer Actions */}
        {step < 4 && (
          <div className="flex justify-between mt-10 pt-6 border-t border-black/10 dark:border-white/10">
            <button 
              onClick={() => setStep(Math.max(1, step - 1))}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : theme.text}`}
            >
              Back
            </button>
            <button 
              onClick={() => setStep(step + 1)}
              className={`px-8 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all ${isNight ? 'bg-[#F5EBE0] text-[#1E1A17]' : 'bg-[#1E1A17] text-[#F5EBE0]'}`}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
