import React, { useState } from 'react'
import dayHeroImg from '../Assets/Dayhero.png'
import nightHeroImg from '../Assets/Nighthero.png'
import mobDayHeroImg from '../Assets/MOBday.png'
import mobNightHeroImg from '../Assets/MOBnight.png'
import logoImg from '../Assets/logo.png'

function App() {
  const [isNight, setIsNight] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Dynamic styling classes that smoothly adapt to the active Day/Night banner (Optimized for rich premium contrast)
  const textColorClass = isNight ? 'text-[#E3D5CA]' : 'text-[#1A1210]'
  const separatorColorClass = isNight ? 'text-[#E3D5CA]/40' : 'text-[#1A1210]/30'

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-black select-none flex flex-col items-center py-12">
      {/* ========================================================================= */}
      {/* DESKTOP BANNER VIEWPORTS (Visible only on lg:block, using original landscape images) */}
      {/* ========================================================================= */}
      {/* Desktop Day Hero Image (Static base, always fully opaque underneath) */}
      <img 
        src={dayHeroImg} 
        alt="SNS Nest Day Banner" 
        className="absolute inset-0 w-full h-full object-cover hidden lg:block" 
      />

      {/* Desktop Night Hero Image (Dissolves smoothly on top of Day) */}
      <img 
        src={nightHeroImg} 
        alt="SNS Nest Night Banner" 
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out hidden lg:block ${
          isNight ? 'opacity-100' : 'opacity-0'
        }`} 
      />

      {/* ========================================================================= */}
      {/* MOBILE/TABLET BANNER VIEWPORTS (Visible only on lg:hidden, using MOBday/MOBnight assets) */}
      {/* ========================================================================= */}
      {/* Mobile Day Hero Image (Static base, always fully opaque underneath) */}
      <img 
        src={mobDayHeroImg} 
        alt="SNS Nest Mobile Day Banner" 
        className="absolute inset-0 w-full h-full object-cover block lg:hidden" 
      />

      {/* Mobile Night Hero Image (Dissolves smoothly on top of Day) */}
      <img 
        src={mobNightHeroImg} 
        alt="SNS Nest Mobile Night Banner" 
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out block lg:hidden ${
          isNight ? 'opacity-100' : 'opacity-0'
        }`} 
      />

      {/* High-End Architectural Slogan Header (Geometric center of the banner, dynamically adapts color shades) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 px-4">
        <h1 className="flex flex-col sm:flex-row items-center sm:items-baseline justify-center gap-y-1 sm:gap-y-0 gap-x-0 sm:gap-x-4 md:gap-x-5 text-center leading-none">
          {/* "YOUR VISION," in Clash Display Bold style (Reduced size for visual hierarchy, stacked on mobile, inline on desktop) */}
          <span className={`font-clash text-[34px] xs:text-[38px] sm:text-[26px] md:text-[35px] lg:text-[45px] xl:text-[52px] font-bold tracking-tight uppercase transition-colors duration-1000 ${
            isNight ? 'text-[#E3D5CA]' : 'text-[#1F130E]'
          }`}>
            YOUR VISION,
          </span>
          {/* "sculpted" in TT Berlinerins Script style (Upscaled size to highlight and make it the focal hero, centered directly underneath on mobile) */}
          <span className={`font-berlinerins text-[70px] xs:text-[76px] sm:text-[52px] md:text-[68px] lg:text-[86px] xl:text-[98px] font-medium lowercase tracking-wide transition-all duration-1000 ${
            isNight 
              ? 'text-[#1A120F] drop-shadow-none' 
              : 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]'
          }`}>
            sculpted
          </span>
        </h1>
      </div>

      {/* Top Left Logo & Company Name (Optically centered on mobile, structured baseline on desktop) */}
      <div className="absolute top-[20px] left-4 md:top-[44px] md:left-12 z-25">
        <a href="#home" className="flex items-center lg:items-start gap-2 sm:gap-2.5 outline-none hover:opacity-80 transition-opacity duration-300">
          {/* Logo Image (Inverts in Night Mode for perfect visual contrast) */}
          <img 
            src={logoImg} 
            alt="SNS Nest Logo" 
            className={`h-8 sm:h-10 md:h-12 w-auto object-contain transition-all duration-300 mt-0 lg:mt-[2px] ${
              isNight ? 'invert brightness-150' : ''
            }`}
          />
          {/* Company Name & Subtitle Stack */}
          <div className={`font-nav-style leading-none flex flex-col items-start mt-0 lg:mt-[4px] transition-colors duration-300 ease-in-out ${textColorClass}`}>
            <span className="text-sm sm:text-base font-extrabold tracking-wider">SNS NEST</span>
            <span className="text-[5px] sm:text-[6.5px] font-normal tracking-[0.05em] opacity-80 uppercase mt-[1px]">
              Find & Design Solutions
            </span>
          </div>
        </a>
      </div>

      {/* Top Right Header Actions Panel (Optically centered glassmorphic capsule on mobile, borderless on desktop) */}
      <div className={`absolute top-[20px] right-4 md:top-[44px] md:right-12 z-30 flex items-center gap-4 sm:gap-6 bg-[#817773]/15 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none py-1.5 px-3 lg:p-0 rounded-full border border-white/5 lg:border-none shadow-sm lg:shadow-none transition-all duration-300 ease-in-out ${textColorClass}`}>
        {/* Profile Icon Link */}
        <a href="#profile" className="block outline-none hover:opacity-80 transition-opacity duration-300 hover:scale-105 active:scale-95 transition-all">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] lg:w-[26px] lg:h-[26px]">
            {/* Floating Head */}
            <circle cx="12" cy="8" r="3.5" />
            {/* Sleek Dressed Shoulder Line */}
            <path d="M5 20c0-3.3 2.7-6 7-6s7 2.7 7 6" />
            {/* Minimalist V-Neck Designer Collar Cut */}
            <path d="M9.5 14l2.5 3 2.5-3" />
          </svg>
        </a>

        {/* Mobile Menu Toggle Button (Visible only on lg:hidden, triggers overlay open) */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden block outline-none hover:opacity-80 transition-all hover:scale-105 active:scale-95 duration-300"
          title="Open Menu"
        >
          {/* Hamburger Menu Icon */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] lg:w-[26px] lg:h-[26px]">
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </div>

      {/* Centered, Perfectly Spaced Top Navigation Bar (Hidden on mobile/tablet, fully visible on desktop) */}
      <nav className={`relative z-20 hidden lg:flex items-center justify-center gap-10 font-nav-style text-sm md:text-base font-extrabold tracking-wider whitespace-nowrap transition-colors duration-300 ease-in-out ${textColorClass}`}>
        <a href="#home" className="hover:scale-105 transition-all duration-300">HOME</a>
        <a href="#reviews" className="hover:scale-105 transition-all duration-300">REVIEWS</a>
        <a href="#portfolio" className="hover:scale-105 transition-all duration-300">PORTFOLIO</a>
        <a href="#about" className="hover:scale-105 transition-all duration-300">ABOUT</a>
        <a href="#contact" className="hover:scale-105 transition-all duration-300">CONTACT</a>
      </nav>

      {/* Unique & Highly Aesthetic Mode Selector (Floats elegantly in absolute bottom-center across all devices) */}
      <div className="absolute bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center bg-[#817773]/40 backdrop-blur-md p-1 rounded-full border border-[#D5BDAF]/20 shadow-2xl select-none w-[104px] h-9">
        {/* Smooth Sliding Pill Backdrop (Linen tone #F5EBE0) */}
        <div 
          className={`absolute top-1 bottom-1 left-1 w-12 rounded-full bg-[#F5EBE0] shadow-md transition-transform duration-300 ease-in-out z-10 ${
            isNight ? 'translate-x-12' : 'translate-x-0'
          }`}
        />
        
        {/* Off Button (Physics Open Circuit Switch / Day Mode) */}
        <button
          onClick={() => setIsNight(false)}
          className={`w-12 h-7 flex items-center justify-center transition-colors duration-300 cursor-pointer uppercase outline-none relative z-20 ${
            !isNight ? 'text-[#4A4340]' : 'text-[#E3D5CA]/60 hover:text-[#E3D5CA]'
          }`}
          title="Circuit Open (Off / Day)"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
            {/* Left Terminal */}
            <circle cx="6" cy="12" r="2.2" fill="currentColor" />
            {/* Right Terminal */}
            <circle cx="18" cy="12" r="2.2" fill="currentColor" />
            {/* Open Lever Switch */}
            <line x1="6" y1="12" x2="16" y2="6" />
          </svg>
        </button>
        
        {/* On Button (Physics Closed Circuit Switch / Night Mode) */}
        <button
          onClick={() => setIsNight(true)}
          className={`w-12 h-7 flex items-center justify-center transition-colors duration-300 cursor-pointer uppercase outline-none relative z-20 ${
            isNight ? 'text-[#4A4340]' : 'text-[#E3D5CA]/60 hover:text-[#E3D5CA]'
          }`}
          title="Circuit Closed (On / Night)"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
            {/* Left Terminal */}
            <circle cx="6" cy="12" r="2.2" fill="currentColor" />
            {/* Right Terminal */}
            <circle cx="18" cy="12" r="2.2" fill="currentColor" />
            {/* Closed Connecting Lever */}
            <line x1="6" y1="12" x2="18" y2="12" />
          </svg>
        </button>
      </div>

      {/* Premium Mobile Menu Overlay (Visible only on lg:hidden when active, utilizing high-contrast backdrop blur and dedicated light-on-dark contrast) */}
      <div 
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-2xl bg-black/95 transition-all duration-500 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Close X Button (Directly inside overlay to prevent stacking context bugs, positioned in exact top-right coordinates) */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-[20px] right-4 outline-none hover:opacity-80 transition-all hover:scale-105 active:scale-95 duration-300 text-[#E3D5CA] py-1.5 px-3 rounded-full border border-white/5 bg-[#817773]/15 shadow-sm backdrop-blur-md"
          title="Close Menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] lg:w-[26px] lg:h-[26px]">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Minimalist Mobile Navigation Links (Unnumbered, high-fashion styling) */}
        <nav className="flex flex-col items-center gap-8 font-nav-style text-2xl font-extrabold tracking-widest">
          <a 
            href="#home" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block text-[#E3D5CA]/70 hover:text-[#F5EBE0] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            HOME
          </a>
          <a 
            href="#reviews" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block text-[#E3D5CA]/70 hover:text-[#F5EBE0] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            REVIEWS
          </a>
          <a 
            href="#portfolio" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block text-[#E3D5CA]/70 hover:text-[#F5EBE0] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            PORTFOLIO
          </a>
          <a 
            href="#about" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block text-[#E3D5CA]/70 hover:text-[#F5EBE0] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            ABOUT
          </a>
          <a 
            href="#contact" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block text-[#E3D5CA]/70 hover:text-[#F5EBE0] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            CONTACT
          </a>
        </nav>

        {/* Dynamic Structural Divider */}
        <div className="w-12 h-[1px] bg-[#E3D5CA]/20 my-6" />

        {/* Symmetrical Mini Footer Tagline */}
        <div className="flex flex-col items-center gap-1 font-nav-style text-center">
          <span className="text-[8px] font-extrabold tracking-[0.2em] uppercase text-[#E3D5CA]/60">SNS NEST</span>
          <span className="text-[6px] font-normal tracking-[0.15em] uppercase text-[#E3D5CA]/40 mt-[1px]">
            Find & Design Solutions
          </span>
        </div>
      </div>
    </div>
  )
}

export default App











