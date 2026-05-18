import React from 'react'
import { motion } from 'framer-motion'
import { useThemeStore } from '../store/themeStore'
import { 
  ArrowRight, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  CreditCard,
  Building2,
  CalendarDays
} from 'lucide-react'

// Common styling to respect the theme system
const THEME = {
  light: {
    card: 'bg-[#E3D5CA]/50 border-[#D6CCC2]/40',
    cardInner: 'bg-[#F5EBE0]/50 border-[#D6CCC2]/20',
    text: 'text-[#2B2B2B]',
    textMuted: 'text-[#4A4340]',
    accent: 'bg-[#C9B7A7]/50 text-[#2B2B2B]',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
  },
  dark: {
    card: 'bg-[#2A241F]/60 border-[#3A312B]',
    cardInner: 'bg-[#1E1A17]/50 border-[#3A312B]',
    text: 'text-[#F5EBE0]',
    textMuted: 'text-[#E3D5CA]/70',
    accent: 'bg-[#3A312B] text-[#F5EBE0]',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.4)]',
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function Dashboard() {
  const { isNight } = useThemeStore()
  const theme = isNight ? THEME.dark : THEME.light

  return (
    <div className="w-full h-full pb-20">
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 lg:mb-12"
      >
        <div>
          <h1 className={`text-3xl lg:text-4xl font-extrabold tracking-tight ${theme.text} mb-2 font-nav-style`}>
            Welcome back, Alex.
          </h1>
          <p className={`text-sm lg:text-base ${theme.textMuted} max-w-xl`}>
            Your Scandinavian minimalist villa project is moving to the material procurement phase.
          </p>
        </div>
        
        <button className={`flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-md border ${theme.card} ${theme.shadow} hover:scale-105 transition-transform duration-300 font-semibold text-sm`}>
          <span>View Master Plan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8"
      >
        
        {/* Main Project Status Card (Spans 8 columns on desktop) */}
        <motion.div variants={itemVariant} className={`col-span-1 md:col-span-12 lg:col-span-8 rounded-3xl p-6 lg:p-8 backdrop-blur-md border ${theme.card} ${theme.shadow} relative overflow-hidden`}>
          {/* Subtle lighting gradient */}
          <div className={`absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none`}></div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${theme.accent} mb-4`}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                In Progress
              </div>
              <h2 className={`text-2xl font-bold ${theme.text}`}>Scandinavian Villa, Phase 2</h2>
              <p className={`text-sm ${theme.textMuted} flex items-center gap-1.5 mt-2`}>
                <MapPin className="w-4 h-4" /> 421 Nordic Way, Seattle
              </p>
            </div>
            <div className={`text-right hidden sm:block`}>
              <div className="text-3xl font-light">68%</div>
              <div className={`text-xs uppercase tracking-wider ${theme.textMuted}`}>Completed</div>
            </div>
          </div>

          {/* Elegant Progress Bar */}
          <div className="w-full h-2 rounded-full bg-black/10 overflow-hidden mb-8 relative z-10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "68%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`h-full rounded-full ${isNight ? 'bg-[#D5BDAF]' : 'bg-[#4A4340]'}`}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            {[
              { label: 'Consultation', status: 'done' },
              { label: 'Design Approval', status: 'done' },
              { label: 'Procurement', status: 'active' },
              { label: 'Execution', status: 'pending' },
            ].map((step, i) => (
              <div key={i} className={`p-4 rounded-2xl border ${theme.cardInner} flex flex-col gap-2`}>
                {step.status === 'done' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500/80" />
                ) : step.status === 'active' ? (
                  <Clock className={`w-5 h-5 ${isNight ? 'text-[#D5BDAF]' : 'text-[#4A4340]'}`} />
                ) : (
                  <div className={`w-5 h-5 rounded-full border-2 border-dashed ${theme.textMuted} opacity-30`} />
                )}
                <span className={`text-xs font-semibold mt-auto ${step.status === 'pending' ? 'opacity-40' : ''}`}>{step.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Meeting Card (Spans 4 columns) */}
        <motion.div variants={itemVariant} className={`col-span-1 md:col-span-6 lg:col-span-4 rounded-3xl p-6 lg:p-8 backdrop-blur-md border ${theme.card} ${theme.shadow} flex flex-col`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-bold ${theme.text}`}>Next Meeting</h3>
            <button className={`p-2 rounded-full ${theme.cardInner} hover:scale-105 transition-transform`}>
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center space-y-4">
              <div className={`w-16 h-16 mx-auto rounded-full bg-linear-to-br from-[#D6CCC2] to-[#817773] p-1`}>
                <div className="w-full h-full rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white font-serif text-xl italic">S</span>
                </div>
              </div>
              <div>
                <h4 className={`font-bold ${theme.text}`}>Sarah Jenkins</h4>
                <p className={`text-xs ${theme.textMuted}`}>Lead Interior Architect</p>
              </div>
              
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${theme.cardInner} text-sm font-medium mt-4`}>
                <Clock className="w-4 h-4" />
                Tomorrow, 10:00 AM PST
              </div>
            </div>
          </div>
          
          <button className={`w-full mt-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${isNight ? 'bg-[#F5EBE0] text-[#1E1A17] hover:bg-white' : 'bg-[#1E1A17] text-[#F5EBE0] hover:bg-black'}`}>
            Join Video Call
          </button>
        </motion.div>

        {/* Quick Stats / Payments (Spans 4 columns) */}
        <motion.div variants={itemVariant} className={`col-span-1 md:col-span-6 lg:col-span-4 rounded-3xl p-6 backdrop-blur-md border ${theme.card} ${theme.shadow}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-sm font-bold uppercase tracking-widest ${theme.textMuted}`}>Payment Status</h3>
            <CreditCard className={`w-5 h-5 ${theme.textMuted}`} />
          </div>
          <div className="space-y-1 mb-6">
            <div className={`text-3xl font-light ${theme.text}`}>₹19,60,000</div>
            <div className={`text-xs ${theme.textMuted}`}>Next milestone due in 14 days</div>
          </div>
          <div className="w-full bg-black/10 rounded-full h-1.5 mb-2 overflow-hidden">
            <div className={`h-full w-1/3 rounded-full ${isNight ? 'bg-[#D5BDAF]' : 'bg-[#4A4340]'}`}></div>
          </div>
          <div className="flex justify-between text-[10px] uppercase tracking-wider opacity-60">
            <span>Paid: ₹9,80,000</span>
            <span>Total: ₹29,40,000</span>
          </div>
        </motion.div>

        {/* Saved Designs Snippet (Spans 8 columns) */}
        <motion.div variants={itemVariant} className={`col-span-1 md:col-span-12 lg:col-span-8 rounded-3xl p-6 backdrop-blur-md border ${theme.card} ${theme.shadow}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-bold ${theme.text}`}>Recent Inspiration</h3>
            <button className={`text-xs uppercase tracking-widest font-semibold hover:underline ${theme.textMuted}`}>View All</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="group relative aspect-4/3 rounded-2xl overflow-hidden cursor-pointer">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
                <img 
                  src={`https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=400&h=300`} 
                  alt="Interior Inspiration"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </motion.div>
        
      </motion.div>
    </div>
  )
}
