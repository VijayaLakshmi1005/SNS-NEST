import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useThemeStore } from './client/store/themeStore'
import dayHeroImg from '../Assets/Dayhero.png'
import nightHeroImg from '../Assets/Nighthero.png'
import mobDayHeroImg from '../Assets/MOBday.png'
import mobNightHeroImg from '../Assets/MOBnight.png'
import logoImg from '../Assets/logo.png'
import testimonySlide1Img from '../Assets/testimonyslide1.png'
import testimonySlide2Img from '../Assets/testimonyslide2.png'
import testimonySlide3Img from '../Assets/testimonyslide3.png'
import testimonySlide4Img from '../Assets/testimonyslide4.png'
import testimonySlide5Img from '../Assets/testimonyslide5.png'
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)



// Precision color interpolator for navigation transition on scroll
const interpolateColor = (color1, color2, factor) => {
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);

  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  const rh = r.toString(16).padStart(2, '0');
  const gh = g.toString(16).padStart(2, '0');
  const bh = b.toString(16).padStart(2, '0');

  return `#${rh}${gh}${bh}`;
};

// High-end staggered text-scramble morph (Starts instantly on progress > 0)
const scrambleText = (startStr, endStr, progress) => {
  if (progress <= 0) return startStr;
  if (progress >= 1) return endStr;

  const glyphs = 'ABCDEGHIKLMNOPRSTUVWXYZZΘΦΨΩ┼';
  const start = startStr.split('');
  const end = endStr.split('');
  const maxLen = Math.max(start.length, end.length);
  let result = '';

  for (let i = 0; i < maxLen; i++) {
    const stagger = (i / maxLen) * 0.3;
    const startThreshold = stagger * 0.4; // Zero-delay: starts scrambling instantly at scroll progress > 0!
    const endThreshold = 0.5 + stagger;

    if (progress < startThreshold) {
      result += start[i] || '';
    } else if (progress > endThreshold) {
      result += end[i] || '';
    } else {
      if (Math.random() > 0.3) {
        result += glyphs[Math.floor(Math.random() * glyphs.length)];
      } else {
        result += end[i] || start[i] || '';
      }
    }
  }
  return result;
};

const reviews = [
  {
    number: "01",
    quote: "SNS NEST transformed our penthouse into a sanctuary of clean lines and quiet luxury. Their eye for detail is unmatched.",
    author: "Elena Rostova",
    role: "Creative Director"
  },
  {
    number: "02",
    quote: "A masterclass in modern spatial design. The flow, the lighting, and the textures feel entirely bespoke.",
    author: "Julian Vance",
    role: "Architectural Lead"
  },
  {
    number: "03",
    quote: "They don't just design rooms; they curate experiences that elevate daily living to an art form.",
    author: "Marc & Sophia",
    role: "Estate Owners"
  },
  {
    number: "04",
    quote: "The seamless integration of smart home features with natural, warm minimalism is absolutely brilliant.",
    author: "David K.",
    role: "Tech Entrepreneur"
  },
  {
    number: "05",
    quote: "From the initial render to the final handover, the craftsmanship and professionalism was flawless.",
    author: "Zara Sterling",
    role: "Design Enthusiast"
  }
];

function App() {
  const { isNight, setNightMode } = useThemeStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const mainSectionRef = useRef(null)
  const horizontalTrackRef = useRef(null)
  const sloganRef = useRef(null)

  useEffect(() => {
    // Initialize Lenis smooth scroll with enhanced touch support
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
      syncTouch: true, // Smooth scrolling on mobile touch events
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // TIMELINE: Pinned Viewport & Horizontal Translate Panel Scroll
    const track = horizontalTrackRef.current;
    const section = mainSectionRef.current;
    const slogan = sloganRef.current;

    let mainTimeline;

    const initTimeline = () => {
      if (!track || !section || !slogan) return;

      mainTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1.2, // Butter-smooth momentum vertical-to-horizontal scrub
          start: "top top",
          end: "bottom bottom",
          invalidateOnRefresh: true // Re-evaluates all values dynamically on resize/orientation changes!
        },
        onUpdate: () => {
          // Dynamically read playhead progress (scrub-smoothed & lag-compensated!)
          if (mainTimeline) {
            setScrollProgress(mainTimeline.progress());
          }
        }
      });

      // 1. Animate horizontal track translation using function-based values for 100% mobile responsiveness
      mainTimeline.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: "none",
      }, 0.35);

      // 2. Animate slogan translation in absolute lockstep using matched function-based values
      mainTimeline.to(slogan, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: "none",
      }, 0.35);
    };

    // Support horizontal scroll from trackpad / shift + scroll wheel
    const handleWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        lenis.scrollBy(e.deltaX);
      }
    };

    // Support horizontal swipes on touchscreens to scroll the track
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 1 && track && track.contains(e.target)) {
        const deltaX = touchStartX - e.touches[0].clientX;
        const deltaY = touchStartY - e.touches[0].clientY;

        // If swipe is predominantly horizontal, redirect it to vertical Lenis scroll
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 8) {
          lenis.scrollBy(deltaX * 0.8);
          touchStartX = e.touches[0].clientX;
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    if (track) {
      track.addEventListener('touchstart', handleTouchStart, { passive: true });
      track.addEventListener('touchmove', handleTouchMove, { passive: true });
    }

    const timer = setTimeout(initTimeline, 100);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
      if (mainTimeline) mainTimeline.scrollTrigger.kill();
      clearTimeout(timer);
      window.removeEventListener('wheel', handleWheel);
      if (track) {
        track.removeEventListener('touchstart', handleTouchStart);
        track.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, []);

  // Synchronized: Ensure morphProgress is strictly active up until the horizontal scroll triggers (at exactly 0.35 progress)
  const morphProgress = scrollProgress < 0.008
    ? 0
    : Math.min(1, (scrollProgress - 0.008) / 0.342);

  // Drive premium dynamic color play for fixed header navigation based on ScrollProgress
  const colorProgress = isNight ? 1 : morphProgress;
  const navTextColor = interpolateColor('#1A1210', '#E3D5CA', colorProgress);
  const shouldInvertLogo = isNight || scrollProgress > 0.15;

  // Single-Layer Scrambles: Scramble directly from start to finish
  const line1Text = scrambleText("YOUR VISION,", "OUR", morphProgress);
  const line2Text = scrambleText("sculpted", "TESTIMONY", morphProgress);

  // Subtext Fade In
  const subtextOpacity = Math.max(0, (morphProgress - 0.5) * 2);

  // Slogan original shadow calculations for Day Mode (dissolves to glowing light backlight on navy background)
  const sloganShadow = isNight
    ? 'none'
    : `0 0 15px rgba(255, 255, 255, 0.95), 0 0 30px rgba(255, 255, 255, ${0.6 * (1 - morphProgress)}), 1px 2px 4px rgba(10, 8, 7, ${0.8 * (1 - morphProgress)}), 2px 4px 10px rgba(10, 8, 7, ${0.65 * (1 - morphProgress)})`;

  // Determine if we should swap to the uniform Neue Montreal style mid-scramble
  const isUniformStyle = scrollProgress > 0.15;

  // Rich Champagne-Beige Color: Smooth subpixel interpolation transitions
  const activeBeigeColor = '#E3D5CA';

  // Line 1: Smoothly transition from charcoal (#1A1210) to champagne beige (#E3D5CA) during the morph
  const currentLine1Color = isNight
    ? activeBeigeColor
    : interpolateColor('#1A1210', activeBeigeColor, morphProgress);

  // Line 2 (sculpted): Shifts colors adaptively based on theme (white on Day, dark charcoal on Night) on page load, blending to beige on scroll!
  const currentLine2Color = isNight
    ? interpolateColor('#1A120F', activeBeigeColor, morphProgress) // Charcoal -> Beige in Night Mode
    : interpolateColor('#FFFFFF', activeBeigeColor, morphProgress); // White -> Beige in Day Mode

  // Matte styling post-morph: remove all glowing outlines and backlights completely when progress > 0.15
  const line2Shadow = scrollProgress > 0.15
    ? 'none'
    : (isNight
      ? `0 0 25px rgba(227, 213, 202, ${0.5 * morphProgress})` // Warm glowing transition in Night Mode
      : sloganShadow);

  // Scroll-driven pastel background color for the testimony section
  // Horizontal scroll starts at 0.35, ends at 1.0 → normalize to 0-1 across 5 color stops
  const testimonyColors = ['#656D4A', '#7D6B5A', '#5A6B6E', '#6B5E78', '#7B5A3C'];
  const testimonyBgColor = (() => {
    if (scrollProgress < 0.35) return testimonyColors[0];
    const t = Math.min(1, (scrollProgress - 0.35) / 0.65);
    const segment = t * (testimonyColors.length - 1);
    const idx = Math.floor(Math.min(segment, testimonyColors.length - 2));
    const frac = segment - idx;
    return interpolateColor(testimonyColors[idx], testimonyColors[idx + 1], frac);
  })();

  return (
    <div className="relative w-full min-h-screen bg-[#656D4A] overflow-x-hidden select-none flex flex-col items-center">
      {/* ========================================================================= */}
      {/* GLOBAL FIXED NAVIGATION HEADERS (Adapts organically on scroll) */}
      {/* ========================================================================= */}
      {/* Top Left Logo & Company Name */}
      <div className="fixed top-[20px] left-4 md:top-[44px] md:left-12 z-35 pointer-events-auto">
        <a href="#home" className="flex items-center lg:items-start gap-2 sm:gap-2.5 outline-none hover:opacity-80 transition-opacity duration-300">
          <img
            src={logoImg}
            alt="SNS Nest Logo"
            className={`h-8 sm:h-10 md:h-12 w-auto object-contain transition-all duration-300 mt-0 lg:mt-[2px] ${shouldInvertLogo ? 'invert brightness-150' : ''
              }`}
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
        className="fixed top-[20px] right-4 md:top-[44px] md:right-12 z-35 flex items-center gap-4 sm:gap-6 bg-[#817773]/15 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none py-1.5 px-3 lg:p-0 rounded-full border border-white/5 lg:border-none shadow-sm lg:shadow-none transition-all duration-300 ease-in-out pointer-events-auto"
        style={{ color: navTextColor }}
      >
        <Link to="/auth/register" className="block outline-none hover:opacity-80 hover:scale-105 active:scale-95 transition-all duration-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] lg:w-[26px] lg:h-[26px]">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20c0-3.3 2.7-6 7-6s7 2.7 7 6" />
            <path d="M9.5 14l2.5 3 2.5-3" />
          </svg>
        </Link>

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
          className={`absolute top-1 bottom-1 left-1 w-12 rounded-full bg-[#F5EBE0] shadow-md transition-transform duration-300 ease-in-out z-10 ${isNight ? 'translate-x-12' : 'translate-x-0'
            }`}
        />
        <button
          onClick={() => setNightMode(false)}
          className={`w-12 h-7 flex items-center justify-center transition-colors duration-300 cursor-pointer uppercase outline-none relative z-20 ${!isNight ? 'text-[#4A4340]' : 'text-[#E3D5CA]/60 hover:text-[#E3D5CA]'
            }`}
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
          className={`w-12 h-7 flex items-center justify-center transition-colors duration-300 cursor-pointer uppercase outline-none relative z-20 ${isNight ? 'text-[#4A4340]' : 'text-[#E3D5CA]/60 hover:text-[#E3D5CA]'
            }`}
          title="Circuit Closed (On / Night)"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
            <circle cx="6" cy="12" r="2.2" fill="currentColor" />
            <circle cx="18" cy="12" r="2.2" fill="currentColor" />
            <line x1="6" y1="12" x2="18" y2="12" />
          </svg>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* UNIFIED SCROLLING STORYTELLING SHOWCASE (h-[350vh] for smooth linear translate) */}
      {/* ========================================================================= */}
      <div ref={mainSectionRef} className="relative w-full h-[350vh] bg-black">
        {/* Pinned Viewport Container (Natively locked via GSAP ScrollTrigger) */}
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden" style={{ backgroundColor: testimonyBgColor, transition: 'background-color 0.1s linear' }}>

          {/* ========================================================================= */}
          {/* INTERACTION LAYER 1: The sliding horizontal track panels (z-10) */}
          {/* ========================================================================= */}
          <div ref={horizontalTrackRef} className="flex flex-row items-center h-full will-change-transform relative z-10">

            {/* SLIDE 0: HERO BANNER SECTION (rising navy backdrop, then X-axis panel slides out) */}
            <div className="w-screen h-screen flex-shrink-0 relative overflow-hidden flex flex-col items-center justify-center">
              {/* Desktop Day Hero Image */}
              <img
                src={dayHeroImg}
                alt="SNS Nest Day Banner"
                className="absolute inset-0 w-full h-full object-cover hidden lg:block z-0"
              />

              {/* Desktop Night Hero Image */}
              <img
                src={nightHeroImg}
                alt="SNS Nest Night Banner"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out hidden lg:block z-0 ${isNight ? 'opacity-100' : 'opacity-0'
                  }`}
              />

              {/* Mobile Day Hero Image */}
              <img
                src={mobDayHeroImg}
                alt="SNS Nest Mobile Day Banner"
                className="absolute inset-0 w-full h-full object-cover block lg:hidden z-0"
              />

              {/* Mobile Night Hero Image */}
              <img
                src={mobNightHeroImg}
                alt="SNS Nest Mobile Night Banner"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out block lg:hidden z-0 ${isNight ? 'opacity-100' : 'opacity-0'
                  }`}
              />

              {/* Deep Sage Rising Backdrop (Slides bottom-to-top behind text) */}
              <div
                className="absolute inset-y-0 left-0 w-[calc(100%+8px)] z-5 will-change-transform overflow-hidden"
                style={{
                  backgroundColor: testimonyBgColor,
                  transform: `translateY(${Math.max(0, (1 - scrollProgress * 3.33) * 100)}%)`
                }}
              >
                <img
                  src={testimonySlide1Img}
                  alt="Testimony Slide 1 Background"
                  className="absolute inset-0 w-full h-full object-contain scale-120 translate-y-12 opacity-75 z-0 select-none pointer-events-none"
                />
              </div>
            </div>

            {/* REVIEW 1: Floating typography, aligned top-left */}
            <div className="w-[60vw] sm:w-[45vw] lg:w-[40vw] h-screen flex-shrink-0 flex flex-col justify-start pt-[20vh] pl-[8vw] relative z-10 -ml-[8px]" style={{ backgroundColor: testimonyBgColor }}>
              {/* Architectural Pin/Callout Indicator */}
              <div className="absolute top-[24.5vh] left-[3vw] flex items-center select-none pointer-events-none z-20">
                <div className="relative flex items-center justify-center w-6 h-6">
                  <div className="absolute w-full h-full rounded-full border border-[#E3D5CA]/20 animate-ping opacity-75 [animation-duration:3s]" />
                  <div className="absolute w-4 h-4 rounded-full border border-[#E3D5CA]/35" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E3D5CA] shadow-[0_0_8px_rgba(227,213,202,0.8)]" />
                </div>
                {/* Meets the border-l at pl-[8vw] (5vw wide) */}
                <div className="w-[5vw] h-[1px] bg-[#E3D5CA]/25" />
              </div>

              {/* Text block with left border */}
              <div className="border-l border-[#E3D5CA]/20 pl-6 sm:pl-8 py-2 relative z-10">
                <p className="font-cormorant italic text-[20px] sm:text-[24px] lg:text-[28px] leading-relaxed text-[#E3D5CA]/90 font-light max-w-lg mb-4">
                  "{reviews[0].quote}"
                </p>
                <div className="w-12 h-px bg-[#E3D5CA]/30 my-4" />
                <h4 className="font-neuemontreal text-xs uppercase tracking-[0.2em] text-[#E3D5CA]/80 font-bold">
                  {reviews[0].author}
                </h4>
                <p className="font-neuemontreal text-[10px] uppercase tracking-[0.15em] text-[#E3D5CA]/40 mt-1">
                  {reviews[0].role}
                </p>
              </div>
            </div>

            {/* SLIDE 1: FULL SCREEN SHOWCASE OF TESTIMONY IMAGE 2 */}
            <div className="w-screen h-screen flex-shrink-0 relative overflow-hidden z-10 -ml-[8px]" style={{ backgroundColor: testimonyBgColor }}>
              <img 
                src={testimonySlide2Img} 
                alt="Testimony Slide 2" 
                className="absolute inset-0 w-full h-full object-contain scale-120 translate-y-15 opacity-75 z-0 select-none pointer-events-none"
              />
            </div>

            {/* REVIEW 2: Floating typography, aligned bottom-right */}
            <div className="w-[60vw] sm:w-[45vw] lg:w-[40vw] h-screen flex-shrink-0 flex flex-col justify-end pb-[22vh] pr-[8vw] items-end relative z-10 -ml-[8px]" style={{ backgroundColor: testimonyBgColor }}>
              {/* Architectural Pin/Callout Indicator */}
              <div className="absolute bottom-[26.5vh] right-[3vw] flex flex-row-reverse items-center select-none pointer-events-none z-20">
                <div className="relative flex items-center justify-center w-6 h-6">
                  <div className="absolute w-full h-full rounded-full border border-[#E3D5CA]/20 animate-ping opacity-75 [animation-duration:3s]" />
                  <div className="absolute w-4 h-4 rounded-full border border-[#E3D5CA]/35" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E3D5CA] shadow-[0_0_8px_rgba(227,213,202,0.8)]" />
                </div>
                {/* Meets the border-r at pr-[8vw] (5vw wide) */}
                <div className="w-[5vw] h-[1px] bg-[#E3D5CA]/25" />
              </div>

              {/* Text block with right border */}
              <div className="border-r border-[#E3D5CA]/20 pr-6 sm:pr-8 py-2 text-right relative z-10">
                <p className="font-cormorant italic text-[20px] sm:text-[24px] lg:text-[28px] leading-relaxed text-[#E3D5CA]/90 font-light max-w-lg mb-4">
                  "{reviews[1].quote}"
                </p>
                <div className="w-12 h-px bg-[#E3D5CA]/30 my-4 ml-auto" />
                <h4 className="font-neuemontreal text-xs uppercase tracking-[0.2em] text-[#E3D5CA]/80 font-bold">
                  {reviews[1].author}
                </h4>
                <p className="font-neuemontreal text-[10px] uppercase tracking-[0.15em] text-[#E3D5CA]/40 mt-1">
                  {reviews[1].role}
                </p>
              </div>
            </div>

            {/* SLIDE 2: FULL SCREEN SHOWCASE OF TESTIMONY IMAGE 3 */}
            <div className="w-screen h-screen flex-shrink-0 relative overflow-hidden z-10 -ml-[8px]" style={{ backgroundColor: testimonyBgColor }}>
              <img 
                src={testimonySlide3Img} 
                alt="Testimony Slide 3" 
                className="absolute inset-0 w-full h-full object-contain scale-120 translate-y-6 opacity-75 z-0 select-none pointer-events-none"
              />
            </div>

            {/* REVIEW 3: Floating typography, aligned top-right */}
            <div className="w-[60vw] sm:w-[45vw] lg:w-[40vw] h-screen flex-shrink-0 flex flex-col justify-start pt-[20vh] pr-[8vw] items-end relative z-10 -ml-[8px]" style={{ backgroundColor: testimonyBgColor }}>
              {/* Architectural Pin/Callout Indicator */}
              <div className="absolute top-[24.5vh] right-[3vw] flex flex-row-reverse items-center select-none pointer-events-none z-20">
                <div className="relative flex items-center justify-center w-6 h-6">
                  <div className="absolute w-full h-full rounded-full border border-[#E3D5CA]/20 animate-ping opacity-75 [animation-duration:3s]" />
                  <div className="absolute w-4 h-4 rounded-full border border-[#E3D5CA]/35" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E3D5CA] shadow-[0_0_8px_rgba(227,213,202,0.8)]" />
                </div>
                {/* Meets the border-r at pr-[8vw] (5vw wide) */}
                <div className="w-[5vw] h-[1px] bg-[#E3D5CA]/25" />
              </div>

              {/* Text block with right border */}
              <div className="border-r border-[#E3D5CA]/20 pr-6 sm:pr-8 py-2 text-right relative z-10">
                <p className="font-cormorant italic text-[20px] sm:text-[24px] lg:text-[28px] leading-relaxed text-[#E3D5CA]/90 font-light max-w-lg mb-4">
                  "{reviews[2].quote}"
                </p>
                <div className="w-12 h-px bg-[#E3D5CA]/30 my-4 ml-auto" />
                <h4 className="font-neuemontreal text-xs uppercase tracking-[0.2em] text-[#E3D5CA]/80 font-bold">
                  {reviews[2].author}
                </h4>
                <p className="font-neuemontreal text-[10px] uppercase tracking-[0.15em] text-[#E3D5CA]/40 mt-1">
                  {reviews[2].role}
                </p>
              </div>
            </div>

            {/* SLIDE 3: FULL SCREEN SHOWCASE OF TESTIMONY IMAGE 4 */}
            <div className="w-screen h-screen flex-shrink-0 relative overflow-hidden z-10 -ml-[8px]" style={{ backgroundColor: testimonyBgColor }}>
              <img 
                src={testimonySlide4Img} 
                alt="Testimony Slide 4" 
                className="absolute inset-0 w-full h-full object-contain scale-120 translate-y-36 opacity-75 z-0 select-none pointer-events-none"
              />
            </div>

            {/* REVIEW 4: Floating typography, aligned bottom-left */}
            <div className="w-[60vw] sm:w-[45vw] lg:w-[40vw] h-screen flex-shrink-0 flex flex-col justify-end pb-[18vh] pl-[8vw] relative z-10 -ml-[8px]" style={{ backgroundColor: testimonyBgColor }}>
              {/* Architectural Pin/Callout Indicator */}
              <div className="absolute bottom-[22vh] left-[3vw] flex items-center select-none pointer-events-none z-20">
                <div className="relative flex items-center justify-center w-6 h-6">
                  <div className="absolute w-full h-full rounded-full border border-[#E3D5CA]/20 animate-ping opacity-75 [animation-duration:3s]" />
                  <div className="absolute w-4 h-4 rounded-full border border-[#E3D5CA]/35" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E3D5CA] shadow-[0_0_8px_rgba(227,213,202,0.8)]" />
                </div>
                {/* Meets the border-l at pl-[8vw] (5vw wide) */}
                <div className="w-[5vw] h-[1px] bg-[#E3D5CA]/25" />
              </div>

              {/* Text block with left border */}
              <div className="border-l border-[#E3D5CA]/20 pl-6 sm:pl-8 py-2 relative z-10">
                <p className="font-cormorant italic text-[20px] sm:text-[24px] lg:text-[28px] leading-relaxed text-[#E3D5CA]/90 font-light max-w-lg mb-4">
                  "{reviews[3].quote}"
                </p>
                <div className="w-12 h-px bg-[#E3D5CA]/30 my-4" />
                <h4 className="font-neuemontreal text-xs uppercase tracking-[0.2em] text-[#E3D5CA]/80 font-bold">
                  {reviews[3].author}
                </h4>
                <p className="font-neuemontreal text-[10px] uppercase tracking-[0.15em] text-[#E3D5CA]/40 mt-1">
                  {reviews[3].role}
                </p>
              </div>
            </div>

            {/* SLIDE 4: FULL SCREEN SHOWCASE OF TESTIMONY IMAGE 5 */}
            <div className="w-screen h-screen flex-shrink-0 relative overflow-hidden z-10 -ml-[8px]" style={{ backgroundColor: testimonyBgColor }}>
              <img 
                src={testimonySlide5Img} 
                alt="Testimony Slide 5" 
                className="absolute inset-0 w-full h-full object-contain scale-90 translate-y-15 opacity-75 z-0 select-none pointer-events-none"
              />
            </div>

            {/* REVIEW 5: Floating typography, aligned center but styled like other left-aligned slides */}
            <div className="w-[60vw] sm:w-[45vw] lg:w-[40vw] h-screen flex-shrink-0 flex flex-col justify-center items-start relative z-10 -ml-[8px]" style={{ backgroundColor: testimonyBgColor }}>
              <div className="flex flex-col items-start text-left max-w-lg -translate-x-[4vw] sm:-translate-x-[6vw] lg:-translate-x-[8vw] relative border-l border-[#E3D5CA]/20 pl-6 sm:pl-8 py-2">
                {/* Architectural Pin/Callout Indicator */}
                <div className="absolute top-[4.5vh] -left-[5vw] flex items-center select-none pointer-events-none z-20">
                  <div className="relative flex items-center justify-center w-6 h-6">
                    <div className="absolute w-full h-full rounded-full border border-[#E3D5CA]/20 animate-ping opacity-75 [animation-duration:3s]" />
                    <div className="absolute w-4 h-4 rounded-full border border-[#E3D5CA]/35" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E3D5CA] shadow-[0_0_8px_rgba(227,213,202,0.8)]" />
                  </div>
                  {/* Meets the border-l exactly */}
                  <div className="w-[5vw] h-[1px] bg-[#E3D5CA]/25" />
                </div>
                <p className="font-cormorant italic text-[20px] sm:text-[24px] lg:text-[28px] leading-relaxed text-[#E3D5CA]/90 font-light mb-4">
                  "{reviews[4].quote}"
                </p>
                <div className="w-12 h-px bg-[#E3D5CA]/30 my-4" />
                <h4 className="font-neuemontreal text-xs uppercase tracking-[0.2em] text-[#E3D5CA]/80 font-bold">
                  {reviews[4].author}
                </h4>
                <p className="font-neuemontreal text-[10px] uppercase tracking-[0.15em] text-[#E3D5CA]/40 mt-1">
                  {reviews[4].role}
                </p>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* INTERACTION LAYER 2: Perfectly Pinned Floating Slogan Overlay (z-20)      */}
          {/* ========================================================================= */}
          <div
            ref={sloganRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 px-4 will-change-transform"
            style={{
              opacity: 1 // Strictly 100% opaque - no disappearing!
            }}
          >
            <div className="text-center flex flex-col items-center justify-center leading-none">

              {/* Single-layer heading: strictly 100% solid opacity throughout scramble phase! */}
              <h1 className="flex flex-col sm:flex-row items-center sm:items-baseline justify-center gap-y-1 sm:gap-y-0 gap-x-0 sm:gap-x-4 md:gap-x-5 text-center leading-none">

                {/* Line 1: YOUR VISION, -> OUR (Beautiful beige when scrambling/settled on navy!) */}
                <span
                  className={`text-[34px] xs:text-[38px] sm:text-[26px] md:text-[35px] lg:text-[45px] xl:text-[52px] font-bold tracking-tight uppercase transition-all duration-300 ${isUniformStyle ? 'font-neuemontreal' : 'font-clash'
                    }`}
                  style={{ color: currentLine1Color }}
                >
                  {line1Text}
                </span>

                {/* Line 2: sculpted -> TESTIMONY (Beautiful beige when scrambling/settled on navy, zero glow!) */}
                <span
                  className={`${isUniformStyle
                      ? 'font-neuemontreal font-bold uppercase'
                      : 'font-berlinerins font-medium lowercase'
                    } text-[34px] xs:text-[38px] sm:text-[26px] md:text-[35px] lg:text-[45px] xl:text-[52px] tracking-tight transition-all duration-300`}
                  style={{
                    color: currentLine2Color,
                    textShadow: line2Shadow
                  }}
                >
                  {line2Text}
                </span>

              </h1>

              {/* Subtext: Designed spaces. Delighted lives. (Permanently in DOM layout to prevent physical vertical jumps!) */}
              <div
                className="font-cormorant italic text-black text-base sm:text-lg md:text-[19px] mt-1 font-medium leading-normal max-w-xl mx-auto transition-all duration-500 tracking-wide"
                style={{
                  opacity: subtextOpacity,
                  filter: `blur(${Math.max(0, (1 - subtextOpacity) * 8)}px)`,
                  transform: `translateY(${Math.max(0, (1 - subtextOpacity) * 20 - 8)}px)`,
                  pointerEvents: subtextOpacity > 0.1 ? 'auto' : 'none'
                }}
              >
                Designed spaces. Delighted lives.
              </div>
            </div>
          </div>

          {/* Scroll explore indicator inside Hero banner */}
          <span
            className="text-[9px] sm:text-[10px] font-nav-style tracking-[0.25em] text-[#E3D5CA]/40 uppercase absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 transition-opacity duration-500 z-10 pointer-events-none"
            style={{ opacity: Math.max(0, 1 - scrollProgress * 5) }}
          >
            SCROLL TO EXPLORE <span className="animate-pulse">→</span>
          </span>

        </div>
      </div>

      {/* Premium Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-2xl bg-black/95 transition-all duration-500 ease-in-out lg:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
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

    </div>
  )
}

export default App
