import React from 'react'

export default function MobileMenu({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-2xl bg-black/95 transition-all duration-500 ease-in-out lg:hidden ${
        isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
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

      <div className="w-12 h-px bg-[#E3D5CA]/20 my-6" />

      <div className="flex flex-col items-center gap-1 font-nav-style text-center">
        <span className="text-[8px] font-extrabold tracking-[0.2em] uppercase text-[#E3D5CA]/60">SNS NEST</span>
        <span className="text-[6px] font-normal tracking-[0.15em] uppercase text-[#E3D5CA]/40 mt-px">
          Find & Design Solutions
        </span>
      </div>
    </div>
  )
}
