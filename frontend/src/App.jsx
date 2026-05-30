import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useThemeStore } from './client/store/themeStore'
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Modular Components, Utilities & Data
import Navbar from './components/Navbar'
import MobileMenu from './components/MobileMenu'
import TestimonyTrack from './components/TestimonyTrack'
import PortfolioIntro from './components/PortfolioIntro'
import AntigravitySequence from './components/AntigravitySequence'
import Preloader from './components/Preloader'
import { reviews } from './data/reviews'
import { interpolateColor, scrambleText } from './utils/scramble'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const location = useLocation()
  const { isNight, setNightMode } = useThemeStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  
  // Preloader State
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [siteLoaded, setSiteLoaded] = useState(false)

  const mainSectionRef = useRef(null)
  const horizontalTrackRef = useRef(null)
  const sloganRef = useRef(null)

  useEffect(() => {
    // Initialize Lenis smooth scroll with enhanced touch support
    const isMobile = window.innerWidth < 768;
    const lenis = new Lenis({
      duration: isMobile ? 1.0 : 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: isMobile ? 1.2 : 1.5,
      syncTouch: true, // Smooth scrolling on mobile touch events
    });
    window.lenis = lenis;

    // Lock scrolling while preloader is active
    if (!siteLoaded) {
      lenis.stop();
      document.body.style.overflow = 'hidden';
    } else {
      lenis.start();
      document.body.style.overflow = '';
    }

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

      // 1. Animate horizontal track translation (35% to 68% of scroll)
      mainTimeline.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: "none",
        duration: 0.33
      }, 0.35);

      // 2. Animate slogan translation in absolute lockstep
      mainTimeline.to(slogan, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: "none",
        duration: 0.33
      }, 0.35);

      // 3. Slogan fade out (68%)
      mainTimeline.to(slogan, {
        opacity: 0,
        scale: 0.92,
        duration: 0.04,
        ease: "power2.out"
      }, 0.68);

      // 4. Cinematic camera pull-back (68% to 85%)
      const getTargetScale = () => {
        const w = window.innerWidth;
        if (w >= 1024) return 0.26; // Desktop: perfectly frames the last 3 slides (approx 380vw)
        if (w >= 768) return 0.28;  // Tablet
        return 0.32; // Mobile: keeps slides from becoming too small
      };

      // Set transform origin to 0px so our math is rock-solid and trivially responsive
      gsap.set(track, { transformOrigin: "0px center" });

      mainTimeline.to(track, {
        scale: getTargetScale,
        x: () => {
          const V = window.innerWidth;
          const W = track.scrollWidth;
          const S = getTargetScale();

          // Focus point: center of the last 3 slides
          // On desktop, the last 3 slides + reviews occupy ~400vw at the end of the track.
          // Center of that block is roughly 200vw from the right edge.
          const isDesktop = V >= 1024;
          const focusDistanceFromRight = isDesktop ? (2.1 * V) : (2.8 * V);
          const focusPoint = W - focusDistanceFromRight;

          // We want the focusPoint to land exactly at the center of the viewport (V / 2)
          // X + focusPoint * S = V / 2  =>  X = V / 2 - focusPoint * S
          return (V / 2) - (focusPoint * S);
        },
        duration: 0.17,
        ease: "power2.inOut" // Smooth, heavy cinematic momentum
      }, 0.68);

      // 5. Hold full gallery composition (85% to 88%)
      mainTimeline.to(track, {
        opacity: 1,
        duration: 0.03
      }, 0.85);

      // 6. Gallery fades softly to background (88% to 100%)
      mainTimeline.to(track, {
        opacity: 0,
        filter: "blur(12px)", // slightly deeper blur for cinematic defocus
        duration: 0.12,
        ease: "power2.in"
      }, 0.88);
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

    // If navigating back from Founders page or via hash links, scroll once site loads
    if (siteLoaded) {
      if (location.state?.scrollToBottom) {
        setTimeout(() => {
          lenis.scrollTo('bottom', { immediate: true });
        }, 200);
      } else if (location.hash) {
        setTimeout(() => {
          const target = document.querySelector(location.hash);
          if (target) {
            lenis.scrollTo(target, { immediate: true });
            setTimeout(() => {
              window.dispatchEvent(new Event('resize'));
              ScrollTrigger.refresh();
            }, 50);
          }
        }, 50);
      }
    }

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
  }, [siteLoaded]);

  // Synchronized: Ensure morphProgress is strictly active up until the horizontal scroll triggers (at exactly 0.35 progress)
  const morphProgress = scrollProgress < 0.008
    ? 0
    : Math.min(1, (scrollProgress - 0.008) / 0.342);

  // Drive premium dynamic color play for fixed header navigation based on ScrollProgress
  const colorProgress = isNight ? 1 : morphProgress;
  let navTextColor = interpolateColor('#1A1210', '#E3D5CA', colorProgress);
  
  // Smoothly transition the navbar text back to dark when zoomout finishes so it looks perfect over the beige Portfolio!
  if (scrollProgress >= 0.85) {
    navTextColor = '#1A1210';
  } else if (scrollProgress > 0.75) {
    const t = (scrollProgress - 0.75) / 0.10;
    navTextColor = interpolateColor('#E3D5CA', '#1A1210', t);
  }
  
  const shouldInvertLogo = isNight || scrollProgress > 0.15 && scrollProgress < 0.8;

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
  // Horizontal scroll runs from 0.35 to ~0.65, camera pull-back from 0.68 to 0.85
  const testimonyColors = ['#656D4A', '#7D6B5A', '#5A6B6E', '#6B5E78', '#7B5A3C'];
  const testimonyBgColor = (() => {
    if (scrollProgress < 0.35) return testimonyColors[0];
    if (scrollProgress >= 0.85) return '#F0E8DC';
    if (scrollProgress >= 0.68) {
      const t = (scrollProgress - 0.68) / 0.17;
      return interpolateColor(testimonyColors[4], '#F0E8DC', t);
    }
    const t = Math.min(1, (scrollProgress - 0.35) / 0.33);
    const segment = t * (testimonyColors.length - 1);
    const idx = Math.floor(Math.min(segment, testimonyColors.length - 2));
    const frac = segment - idx;
    return interpolateColor(testimonyColors[idx], testimonyColors[idx + 1], frac);
  })();

  return (
    <>
      {!siteLoaded && (
        <Preloader 
          progress={loadingProgress} 
          onComplete={() => setSiteLoaded(true)} 
        />
      )}
      <div className="relative w-full min-h-screen bg-[#656D4A] select-none flex flex-col items-center">
      {/* GLOBAL FIXED NAVIGATION HEADERS (Adapts organically on scroll) */}
      <Navbar
        shouldInvertLogo={shouldInvertLogo}
        navTextColor={navTextColor}
        scrollProgress={scrollProgress}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* ========================================================================= */}
      {/* UNIFIED SCROLLING STORYTELLING SHOWCASE (h-[350vh] for smooth linear translate) */}
      {/* ========================================================================= */}
      <div id="home" className="absolute top-0 w-full h-10 pointer-events-none" />
      <div id="reviews" ref={mainSectionRef} className="relative w-full h-[350vh] bg-[#C7A58D]">
        {/* Pinned Viewport Container (Natively locked via GSAP ScrollTrigger) */}
        <div className="sticky top-0 left-0 w-full h-screen mobile-dvh overflow-hidden" style={{ backgroundColor: testimonyBgColor, transition: 'background-color 0.1s linear' }}>

          {/* ========================================================================= */}
          {/* INTERACTION LAYER 1: The sliding horizontal track panels (z-10) */}
          {/* ========================================================================= */}
          <TestimonyTrack
            isNight={isNight}
            scrollProgress={scrollProgress}
            testimonyBgColor={testimonyBgColor}
            reviews={reviews}
            ref={horizontalTrackRef}
          />

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
            <div className="text-center flex flex-col items-center justify-center leading-none -translate-y-[10vh] sm:translate-y-0">

              {/* Single-layer heading: strictly 100% solid opacity throughout scramble phase! */}
              <h1 className="flex flex-col sm:flex-row items-center sm:items-baseline justify-center gap-y-1 sm:gap-y-0 gap-x-0 sm:gap-x-4 md:gap-x-5 text-center leading-none">

                {/* Line 1: YOUR VISION, -> OUR (Beautiful beige when scrambling/settled on navy!) */}
                <span
                  className={`text-[26px] xs:text-[30px] sm:text-[26px] md:text-[35px] lg:text-[45px] xl:text-[52px] font-bold tracking-tight uppercase transition-all duration-300 ${isUniformStyle ? 'font-neuemontreal' : 'font-clash'
                    }`}
                  style={{ color: currentLine1Color }}
                >
                  {line1Text}
                </span>

                {/* Line 2: sculpted -> TESTIMONY (Beautiful beige when scrambling/settled on navy, zero glow!) */}
                <span
                  className={`${isUniformStyle
                    ? 'font-neuemontreal font-bold uppercase text-[26px] xs:text-[30px] sm:text-[26px] md:text-[35px] lg:text-[45px] xl:text-[52px]'
                    : 'font-berlinerins font-medium lowercase text-[46px] xs:text-[52px] sm:text-[46px] md:text-[60px] lg:text-[76px] xl:text-[88px]'
                    } tracking-tight transition-all duration-300`}
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

      {/* ========================================================================= */}
      {/* INTERACTION LAYER 3: CREAM PORTFOLIO CANVAS (Scrolls naturally after pin) */}
      {/* ========================================================================= */}
      <PortfolioIntro />

      {/* ========================================================================= */}
      {/* INTERACTION LAYER 4: ANTIGRAVITY TIMELINE + CONTACT REVEAL               */}
      {/* ========================================================================= */}
      <AntigravitySequence onProgress={setLoadingProgress} />

      {/* Premium Mobile Menu Overlay */}
      <MobileMenu isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

    </div>
    </>
  )
}

export default App
