import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useThemeStore } from '../client/store/themeStore'
import { useAuthStore } from '../store/useAuthStore'
import logoImg from '../../Assets/logo.png'

export default function Navbar({
  shouldInvertLogo,
  navTextColor,
  scrollProgress,
  setIsMobileMenuOpen
}) {
  const { isNight, setNightMode } = useThemeStore()
  const { isAuthenticated, role, logout } = useAuthStore()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)

  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false)
    navigate('/')
  }

  return (
    <>
      {/* Top Left Logo & Company Name */}
      <div className="fixed top-[20px] left-4 md:top-[44px] md:left-12 z-35 pointer-events-auto">
        <a href="#home" className="flex items-center lg:items-start gap-2 sm:gap-2.5 outline-none hover:opacity-80 transition-opacity duration-300">
          <img
            src={logoImg}
            alt="SNS Nest Logo"
            className={`h-8 sm:h-10 md:h-12 w-auto object-contain transition-all duration-300 mt-0 lg:mt-[2px] ${shouldInvertLogo ? 'invert brightness-150' : ''}`}
          />
          <div
            className="font-nav-style leading-none flex flex-col items-start mt-0 lg:mt-[4px] transition-colors duration-300 ease-in-out"
            style={{ color: navTextColor }}
          >
            <span className="text-sm sm:text-base font-extrabold tracking-wider">SNS NEST</span>
            <span className="text-[5px] sm:text-[6.5px] font-normal tracking-wider opacity-80 uppercase mt-px">
              Find & Design Solutions
            </span>
          </div>
        </a>
      </div>

      {/* Top Right Header Actions Panel */}
      <div
        className="fixed top-[20px] right-4 md:top-[44px] md:right-12 z-50 flex items-center gap-4 sm:gap-6 bg-[#817773]/15 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none py-1.5 px-3 lg:p-0 rounded-full border border-white/5 lg:border-none shadow-sm lg:shadow-none transition-all duration-300 ease-in-out pointer-events-auto"
        style={{ color: navTextColor }}
      >
        <div className="relative">
          {isAuthenticated ? (
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="block outline-none hover:opacity-80 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] lg:w-[26px] lg:h-[26px]">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20c0-3.3 2.7-6 7-6s7 2.7 7 6" />
                <path d="M9.5 14l2.5 3 2.5-3" />
              </svg>
            </button>
          ) : (
            <Link to="/auth/login" className="block outline-none hover:opacity-80 hover:scale-105 active:scale-95 transition-all duration-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] lg:w-[26px] lg:h-[26px]">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20c0-3.3 2.7-6 7-6s7 2.7 7 6" />
                <path d="M9.5 14l2.5 3 2.5-3" />
              </svg>
            </Link>
          )}

          {/* Dynamic Dropdown */}
          {isAuthenticated && isDropdownOpen && (
            <div className="absolute right-0 mt-4 w-48 bg-[#fbfbf9] rounded-xl shadow-2xl border border-[#e6e6df] overflow-hidden text-[#1a1a1a] font-nav-style">
              {role === 'client' && (
                <div className="py-2">
                  <Link to="/client/dashboard" className="block px-4 py-2 text-sm hover:bg-[#e6e6df] transition" onClick={() => setIsDropdownOpen(false)}>My Dashboard</Link>
                  <Link to="/client/wishlist" className="block px-4 py-2 text-sm hover:bg-[#e6e6df] transition" onClick={() => setIsDropdownOpen(false)}>Wishlist</Link>
                  <Link to="/client/booking" className="block px-4 py-2 text-sm hover:bg-[#e6e6df] transition" onClick={() => setIsDropdownOpen(false)}>Consultations</Link>
                </div>
              )}
              {role === 'admin' && (
                <div className="py-2">
                  <Link to="/admin/dashboard" className="block px-4 py-2 text-sm font-bold text-amber-800 hover:bg-[#e6e6df] transition" onClick={() => setIsDropdownOpen(false)}>Admin Panel</Link>
                  <Link to="/admin/users" className="block px-4 py-2 text-sm hover:bg-[#e6e6df] transition" onClick={() => setIsDropdownOpen(false)}>Users</Link>
                  <Link to="/admin/projects" className="block px-4 py-2 text-sm hover:bg-[#e6e6df] transition" onClick={() => setIsDropdownOpen(false)}>Projects</Link>
                </div>
              )}
              {role === 'designer' && (
                <div className="py-2">
                  <Link to="/designer/dashboard" className="block px-4 py-2 text-sm font-bold text-amber-800 hover:bg-[#e6e6df] transition" onClick={() => setIsDropdownOpen(false)}>Designer Workspace</Link>
                  <Link to="/designer/projects" className="block px-4 py-2 text-sm hover:bg-[#e6e6df] transition" onClick={() => setIsDropdownOpen(false)}>My Projects</Link>
                </div>
              )}
              <div className="border-t border-[#e6e6df] py-1">
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 font-bold transition">Logout</button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden block outline-none hover:opacity-80 transition-all hover:scale-105 active:scale-95 duration-300"
          title="Open Menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] lg:w-[26px] lg:h-[26px]">
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </div>

      {/* Centered, Perfectly Spaced Top Navigation Bar */}
      <nav
        className="fixed top-8 md:top-12 left-1/2 -translate-x-1/2 z-35 hidden lg:flex items-center justify-center gap-10 font-nav-style text-sm md:text-base font-extrabold tracking-wider whitespace-nowrap transition-colors duration-300 ease-in-out pointer-events-auto"
        style={{ color: navTextColor }}
      >
        <a href="#home" className="hover:scale-105 transition-all duration-300">HOME</a>
        <a href="#reviews" className="hover:scale-105 transition-all duration-300">REVIEWS</a>
        <a href="#portfolio" className="hover:scale-105 transition-all duration-300">PORTFOLIO</a>
        <a href="#about" className="hover:scale-105 transition-all duration-300">ABOUT</a>
        <a href="#contact" className="hover:scale-105 transition-all duration-300">CONTACT</a>
      </nav>

      {/* Unique & Highly Aesthetic Mode Selector Switch */}
      <div
        className="fixed bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 z-25 flex items-center bg-[#817773]/40 backdrop-blur-md p-1 rounded-full border border-[#D5BDAF]/20 shadow-2xl select-none w-[104px] h-9 pointer-events-auto transition-opacity duration-500"
        style={{
          opacity: Math.max(0, 1 - scrollProgress * 5),
          pointerEvents: scrollProgress > 0.18 ? 'none' : 'auto'
        }}
      >
        <div
          className={`absolute top-1 bottom-1 left-1 w-12 rounded-full bg-[#F5EBE0] shadow-md transition-transform duration-300 ease-in-out z-10 ${isNight ? 'translate-x-12' : 'translate-x-0'}`}
        />
        <button
          onClick={() => setNightMode(false)}
          className={`w-12 h-7 flex items-center justify-center transition-colors duration-300 cursor-pointer uppercase outline-none relative z-20 ${!isNight ? 'text-[#4A4340]' : 'text-[#E3D5CA]/60 hover:text-[#E3D5CA]'}`}
          title="Circuit Open (Off / Day)"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
            <circle cx="6" cy="12" r="2.2" fill="currentColor" />
            <circle cx="18" cy="12" r="2.2" fill="currentColor" />
            <line x1="6" y1="12" x2="16" y2="6" />
          </svg>
        </button>

        <button
          onClick={() => setNightMode(true)}
          className={`w-12 h-7 flex items-center justify-center transition-colors duration-300 cursor-pointer uppercase outline-none relative z-20 ${isNight ? 'text-[#4A4340]' : 'text-[#E3D5CA]/60 hover:text-[#E3D5CA]'}`}
          title="Circuit Closed (On / Night)"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
            <circle cx="6" cy="12" r="2.2" fill="currentColor" />
            <circle cx="18" cy="12" r="2.2" fill="currentColor" />
            <line x1="6" y1="12" x2="18" y2="12" />
          </svg>
        </button>
      </div>
    </>
  )
}
