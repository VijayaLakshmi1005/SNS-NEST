import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import projects from '../data/projects'

export default function PortfolioIntro() {
  const navigate = useNavigate()
  const [hasHovered, setHasHovered] = useState(false)

  const featuredProject = projects.find(p => p.featured) || projects[0]
  const supportingProjects = projects.filter(p => p.id !== featuredProject.id).slice(0, 4)

  const renderCard = (project, index, isFeatured) => {
    // ADMIN CMS LOGIC: Fallback to static stock image if no uploaded image exists
    const imageUrl = project.uploadedImage || project.image || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80'

    return (
      <div
        key={project.id}
        onClick={() => navigate(`/portfolio/${project.slug}`)}
        className={`group relative overflow-hidden cursor-pointer rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-[#E8DAB9]/10 ${isFeatured ? 'col-span-1 lg:col-span-7 h-[45vh] sm:h-[50vh] lg:h-[70vh]' : 'col-span-1 h-[35vh] lg:h-[33.5vh]'
          }`}
      >
        {/* Real Image - INSTANT LOAD */}
        <div className="absolute inset-0 w-full h-full transform transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105">
          <img
            src={imageUrl}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Dark Bottom Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

        {/* Minimal Project Numbering */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 text-[10px] sm:text-xs font-neuemontreal text-white/50 font-bold tracking-[0.15em] select-none z-10 mix-blend-overlay">
          {String(project.id).padStart(2, '0')}
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 lg:p-8 transform transition-transform duration-500 group-hover:-translate-y-2 z-20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[8px] sm:text-[9px] tracking-[0.25em] text-white/70 font-neuemontreal uppercase font-semibold">
              {project.category}
            </span>
            <div className="w-3 h-[1px] bg-white/30" />
            <span className="text-[8px] sm:text-[9px] tracking-[0.2em] text-white/50 font-neuemontreal uppercase">
              {project.location}
            </span>
          </div>
          <h3 className="font-cormorant italic text-2xl sm:text-3xl lg:text-4xl text-white font-light leading-tight mb-3">
            {project.title}
          </h3>
          <div className="flex items-center gap-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-100">
            <span className="text-[10px] sm:text-xs tracking-[0.15em] text-white/90 font-neuemontreal uppercase">
              View Project
            </span>
            <span className="text-white/90 text-sm">→</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id="portfolio" className="portfolio-intro-canvas relative w-full z-40 bg-[#C7A58D]">
      {/* Invisible mask to fade out text before it hits the transparent navbar */}
      <div className="sticky top-0 left-0 w-full h-[180px] pointer-events-none z-30 bg-gradient-to-b from-[#C7A58D] via-[#C7A58D] to-transparent" />
      
      <div className="relative w-full min-h-screen flex flex-col px-4 sm:px-8 lg:px-12 xl:px-16 pt-56 sm:pt-64 lg:pt-72 pb-[35vh] lg:pb-[40vh] max-w-[1800px] mx-auto -mt-[180px] z-10">

        {/* ── Section Header ── */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left mb-6 sm:mb-8 lg:mb-12">
          <span className="text-[9px] sm:text-[10px] tracking-[0.45em] text-[#1A1210]/50 font-neuemontreal uppercase font-semibold block mb-3 sm:mb-4">
            Portfolio
          </span>
          <h2 className="font-cormorant italic text-4xl sm:text-5xl lg:text-[64px] text-[#1A1210] font-light leading-none mb-4 sm:mb-6">
            Our Works
          </h2>
          <p className="text-xs sm:text-sm text-[#1A1210]/50 font-neuemontreal leading-relaxed max-w-md mx-auto sm:mx-0">
            Transforming spaces into stories. Every corner, every detail, crafted with passion and purpose.
          </p>
        </div>

        {/* ── Divider ── */}
        <div className="w-full h-[1px] bg-[#1A1210]/10 mb-8 sm:mb-12" />

        {/* ── Asymmetrical Editorial Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 mb-16 sm:mb-24">
          {/* Left: Large Featured Card */}
          {renderCard(featuredProject, 0, true)}

          {/* Right: 4 Supporting Cards */}
          <div className="col-span-1 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-6 content-start">
            {supportingProjects.map((project, idx) => renderCard(project, idx + 1, false))}
          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div id="contact" className="flex flex-col items-center justify-center text-center mt-auto pt-8 sm:pt-12 border-t border-[#1A1210]/10">
          <h3 className="font-cormorant italic text-2xl sm:text-3xl lg:text-4xl text-[#1A1210] font-light mb-6">
            Let’s create something beautiful together.
          </h3>
          <button
            onClick={() => navigate('/contact')}
            onMouseEnter={() => setHasHovered(true)}
            // Changed hover border to soft pastel green
            className={`group relative flex items-center justify-center gap-3 px-8 py-4 rounded-full border transition-colors duration-300 bg-transparent overflow-hidden ${hasHovered ? 'border-[#FFFFFF]' : 'border-[#FFFFFF]/20 hover:border-[#B7F5C8]'}`}
          >
            <div // Changed hover background to bright pastel green
              className={`absolute inset-0 bg-[#FFFFFF] transition-transform duration-500 ease-out ${hasHovered ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}`} />
            <span className="relative z-10 text-[10px] sm:text-xs tracking-[0.2em] text-[#1A1210] font-neuemontreal uppercase font-medium">
              Start A Project
            </span>
            <span // Added black text effect on hover
              className={`relative z-10 text-[10px] sm:text-xs tracking-[0.2em] font-neuemontreal uppercase font-medium transition-colors duration-300 ${hasHovered ? 'text-black' : 'text-[#1A1210] group-hover:text-black'}`}>→</span>
          </button>
        </div>

      </div>
    </div>
  )
}
