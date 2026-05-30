import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'
import { apiRequest } from '../utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarDays,
  Calculator,
  Wand2,
  Image as ImageIcon,
  MessageSquare,
  CreditCard,
  Heart,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  Settings
} from 'lucide-react'

// Common styling variables mirroring the exact homepage color system
const THEME = {
  light: {
    bg: 'bg-[#F5EBE0]',
    card: 'bg-[#E3D5CA]/50 backdrop-blur-md',
    text: 'text-[#2B2B2B]',
    textMuted: 'text-[#4A4340]',
    border: 'border-[#D6CCC2]/40',
    hover: 'hover:bg-[#D6CCC2]/30',
    active: 'bg-[#C9B7A7]/50',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
  },
  dark: {
    bg: 'bg-[#1E1A17]',
    card: 'bg-[#2A241F]/60 backdrop-blur-md',
    text: 'text-[#F5EBE0]',
    textMuted: 'text-[#E3D5CA]/70',
    border: 'border-[#3A312B]',
    hover: 'hover:bg-[#3A312B]/50',
    active: 'bg-[#3A312B]',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.4)]',
  }
}

const SIDEBAR_LINKS = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/client/dashboard' },
  { name: 'Designs', icon: ImageIcon, path: '/client/designs' },
  { name: 'Floor Plans', icon: ImageIcon, path: '/client/floor-plans' },
  { name: 'Design Center', icon: Wand2, path: '/client/design-center' },
  { name: 'Consultations', icon: CalendarDays, path: '/client/booking' },
  { name: 'Estimation', icon: Calculator, path: '/client/estimate' },
  { name: 'Tracking', icon: Bell, path: '/client/tracking' },
  { name: 'Messages', icon: MessageSquare, path: '/client/chat' },
  { name: 'Wishlist', icon: Heart, path: '/client/wishlist' },
  { name: 'Payments', icon: CreditCard, path: '/client/payment' },
]

export default function ClientLayout() {
  const { isNight, toggleTheme } = useThemeStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  const currentTheme = isNight ? THEME.dark : THEME.light
  const navigate = useNavigate()
  const [userProfile, setUserProfile] = useState(null)

  // Don't show sidebar for auth pages
  const isAuthPage = location.pathname.includes('/auth')

  useEffect(() => {
    if (isAuthPage) return;
    const fetchMe = async () => {
      try {
        const res = await apiRequest('/auth/me')
        setUserProfile(res.data)
      } catch (err) {
        console.error('Error fetching user info:', err)
      }
    }
    fetchMe()
  }, [location.pathname, isAuthPage])

  if (isAuthPage) {
    return (
      <div className={`min-h-screen w-full transition-colors duration-700 ease-in-out ${currentTheme.bg} ${currentTheme.text} font-nav-style`}>
        <Outlet />
      </div>
    )
  }

  return (
    <div className={`flex min-h-screen w-full overflow-hidden transition-colors duration-700 ease-in-out ${currentTheme.bg} ${currentTheme.text} font-nav-style`}>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Floating Elegant Sidebar */}
      <motion.aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 shrink-0 flex flex-col transform transition-transform duration-500 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className={`h-[calc(100vh-2rem)] m-4 rounded-3xl ${currentTheme.card} ${currentTheme.border} border ${currentTheme.shadow} flex flex-col relative overflow-hidden`}>

          {/* Subtle noise texture overlay for premium feel */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay noise-bg"></div>

          {/* Logo / Brand */}
          <div className="p-8 flex items-center justify-between z-10">
            <div className="flex flex-col">
              <Link to="/" className="text-xl font-extrabold tracking-wider">SNS NEST</Link>
              <span className={`text-[8px] tracking-[0.15em] uppercase ${currentTheme.textMuted} mt-1`}>Client Portal</span>
            </div>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X className={`w-5 h-5 ${currentTheme.textMuted}`} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1 z-10 scrollbar-hide">
            {SIDEBAR_LINKS.map((link) => {
              const isActive = location.pathname.includes(link.path)
              const Icon = link.icon
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                      ? `${currentTheme.active} ${currentTheme.shadow} font-semibold scale-[1.02]`
                      : `${currentTheme.hover} ${currentTheme.textMuted} hover:text-current`
                    }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
                  <span className="text-sm tracking-wide">{link.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Bottom Actions */}
          <div className={`p-6 mt-auto border-t ${currentTheme.border} z-10 space-y-4`}>
            {/* Theme Toggle that matches Homepage feel */}
            <div className={`flex items-center justify-between p-3 rounded-2xl ${isNight ? 'bg-[#1a1613]' : 'bg-[#f0e3d5]'}`}>
              <span className={`text-xs uppercase tracking-widest font-semibold ${currentTheme.textMuted}`}>Theme</span>
              <button
                onClick={toggleTheme}
                className="relative w-12 h-6 flex items-center rounded-full bg-black/10 transition-colors"
              >
                <motion.div
                  className={`absolute left-1 w-4 h-4 rounded-full ${isNight ? 'bg-[#F5EBE0]' : 'bg-[#2B2B2B]'}`}
                  animate={{ x: isNight ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <Link to="/client/profile" className={`flex items-center gap-3 px-3 py-2 rounded-2xl ${currentTheme.hover} transition-colors flex-1 min-w-0`}>
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#D6CCC2] to-[#817773] flex items-center justify-center overflow-hidden shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate">{userProfile?.fullName || 'Client User'}</span>
                  <span className={`text-[10px] uppercase tracking-wider ${currentTheme.textMuted} truncate`}>{userProfile?.role || 'Client'}</span>
                </div>
              </Link>
              <button 
                onClick={async () => {
                  try {
                    await apiRequest('/auth/logout', { method: 'POST', body: {} });
                  } catch (e) {
                    console.error('Logout request failed', e);
                  }
                  localStorage.removeItem('token');
                  navigate('/auth/login');
                }}
                className={`p-3 rounded-2xl ${currentTheme.hover} transition-colors text-red-500/80 hover:text-red-500 hover:bg-red-500/10`}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen relative z-10 overflow-x-hidden">

        {/* Mobile Header */}
        <header className={`lg:hidden flex items-center justify-between p-4 sticky top-0 z-30 ${currentTheme.bg}/80 backdrop-blur-xl border-b ${currentTheme.border}`}>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-wider">SNS NEST</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className={`p-2 rounded-full ${currentTheme.hover}`}>
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {/* Framer motion page transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="h-full max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

    </div>
  )
}
