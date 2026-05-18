import React from 'react'
import { motion } from 'framer-motion'
import { useThemeStore } from '../store/themeStore'
import { CheckCircle2, CircleDashed, Hammer, Package, PenTool, Truck, Home } from 'lucide-react'

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

const TIMELINE = [
  { id: 1, title: 'Consultation Completed', date: 'Oct 01, 2026', status: 'done', icon: PenTool },
  { id: 2, title: 'Design Approved', date: 'Oct 10, 2026', status: 'done', icon: CheckCircle2 },
  { id: 3, title: 'Material Procurement', date: 'Ongoing', status: 'active', icon: Package },
  { id: 4, title: 'Execution Started', date: 'Pending', status: 'pending', icon: Hammer },
  { id: 5, title: 'Installation', date: 'Pending', status: 'pending', icon: Truck },
  { id: 6, title: 'Final Delivery', date: 'Pending', status: 'pending', icon: Home },
]

export default function Tracking() {
  const { isNight } = useThemeStore()
  const theme = isNight ? THEME.dark : THEME.light

  return (
    <div className="w-full h-full pb-20 max-w-5xl mx-auto">
      
      <div className="text-center mb-12">
        <h1 className={`text-3xl lg:text-5xl font-extrabold tracking-tight ${theme.text} mb-4 font-nav-style`}>
          Project Tracking
        </h1>
        <p className={`text-sm lg:text-base ${theme.textMuted}`}>
          Real-time updates on your Scandinavian Villa project.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <div className={`p-8 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md relative`}>
            
            <div className="absolute top-12 bottom-12 left-12 w-0.5 bg-black/10 dark:bg-white/10" />

            <div className="space-y-10 relative">
              {TIMELINE.map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={item.id} 
                    className="flex gap-6 items-start"
                  >
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center z-10 transition-colors ${
                      item.status === 'done' ? (isNight ? 'bg-[#F5EBE0] text-[#1E1A17]' : 'bg-[#1E1A17] text-[#F5EBE0]') :
                      item.status === 'active' ? 'bg-orange-500 text-white' :
                      `bg-black/10 dark:bg-white/10 ${theme.textMuted}`
                    }`}>
                      {item.status === 'done' ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    
                    <div className={`flex-1 p-5 rounded-2xl border transition-all ${item.status === 'active' ? `border-orange-500/50 shadow-lg ${theme.cardInner}` : `${theme.cardInner} border-transparent`}`}>
                      <h4 className={`font-bold ${theme.text} mb-1`}>{item.title}</h4>
                      <p className={`text-xs uppercase tracking-widest font-semibold ${item.status === 'active' ? 'text-orange-500' : theme.textMuted}`}>
                        {item.date}
                      </p>
                      
                      {item.status === 'active' && (
                        <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 space-y-3">
                          <p className={`text-sm ${theme.textMuted}`}>Italian marble and oak wood panels have arrived at the warehouse.</p>
                          {/* Progress bar for current step */}
                          <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: "60%" }} className="h-full bg-orange-500 rounded-full" />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Site Photos Gallery */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`p-8 rounded-3xl border ${theme.card} ${theme.shadow} backdrop-blur-md`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${theme.text}`}>Site Photos</h3>
              <button className={`text-xs uppercase tracking-widest font-semibold hover:underline ${theme.textMuted}`}>View All</button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=400',
                'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=400',
                'https://images.unsplash.com/photo-1541888087405-131715628eb4?auto=format&fit=crop&q=80&w=400',
                'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400'
              ].map((img, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden group relative cursor-pointer">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10" />
                  <img src={img} alt="Site Progress" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute bottom-2 left-2 z-20">
                    <span className="px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] text-white font-bold">Oct 12</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
