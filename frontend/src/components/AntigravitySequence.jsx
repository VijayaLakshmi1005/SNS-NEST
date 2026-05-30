import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import logoImg from '../../Assets/logo.png';
import { Link } from 'react-router-dom';

import senthilImg from '../../Assets/senthil.jpeg';
import sreenivasImg from '../../Assets/sreenivas.jpeg';
import narendraImg from '../../Assets/nerendra.jpeg';

gsap.registerPlugin(ScrollTrigger);

// Eagerly load all image frames. Keys will be the file paths, so we sort them to ensure correct sequence.
const modules = import.meta.glob('../../Assets/webp/*.webp', { eager: true });
const framePaths = Object.keys(modules)
  .sort()
  .map(key => modules[key].default || modules[key]);

const StreamContent = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <React.Fragment key={i}>
        {/* LOGO IMAGE */}
        <div className="flex items-center mx-8 opacity-80">
          <span className="w-20 h-20 md:w-32 md:h-32 rounded-full border border-[#2A3B32]/10 flex items-center justify-center bg-[#2A3B32]/5 backdrop-blur-md shadow-[0_4px_20px_rgba(42,59,50,0.05)]">
            <img src={logoImg} alt="SNS NEST Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-[0_2px_10px_rgba(42,59,50,0.2)]" />
          </span>
        </div>

        {/* LOGO TEXT */}
        <div className="flex items-center gap-4 opacity-90 mx-8">
          <span className="font-nav-style font-extrabold tracking-[0.3em] uppercase text-4xl md:text-5xl lg:text-6xl text-[#2A3B32] drop-shadow-[0_2px_10px_rgba(42,59,50,0.1)]">
            SNS NEST
          </span>
        </div>
        
        {/* LINKEDIN */}
        <div className="flex items-center mx-8 opacity-80">
          <span className="w-16 h-16 md:w-24 md:h-24 rounded-full border border-[#2A3B32]/10 flex items-center justify-center bg-[#2A3B32]/5 backdrop-blur-md shadow-[0_4px_20px_rgba(42,59,50,0.05)]">
            <svg viewBox="0 0 24 24" fill="#2A3B32" className="w-8 h-8 md:w-10 md:h-10"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          </span>
        </div>

        {/* INSTAGRAM */}
        <div className="flex items-center mx-8 opacity-80">
          <span className="w-16 h-16 md:w-24 md:h-24 rounded-full border border-[#2A3B32]/10 flex items-center justify-center bg-[#2A3B32]/5 backdrop-blur-md shadow-[0_4px_20px_rgba(42,59,50,0.05)]">
            <svg viewBox="0 0 24 24" fill="#2A3B32" className="w-8 h-8 md:w-10 md:h-10"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </span>
        </div>

        {/* WHATSAPP */}
        <div className="flex items-center mx-8 opacity-80">
          <span className="w-16 h-16 md:w-24 md:h-24 rounded-full border border-[#2A3B32]/10 flex items-center justify-center bg-[#2A3B32]/5 backdrop-blur-md shadow-[0_4px_20px_rgba(42,59,50,0.05)]">
            <svg viewBox="0 0 24 24" fill="#2A3B32" className="w-8 h-8 md:w-10 md:h-10"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.88-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          </span>
        </div>

        {/* FACEBOOK */}
        <div className="flex items-center mx-8 opacity-80">
          <span className="w-16 h-16 md:w-24 md:h-24 rounded-full border border-[#2A3B32]/10 flex items-center justify-center bg-[#2A3B32]/5 backdrop-blur-md shadow-[0_4px_20px_rgba(42,59,50,0.05)]">
            <svg viewBox="0 0 24 24" fill="#2A3B32" className="w-8 h-8 md:w-10 md:h-10"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
          </span>
        </div>

        {/* PHONE */}
        <div className="flex items-center mx-8 opacity-80">
          <span className="w-16 h-16 md:w-24 md:h-24 rounded-full border border-[#2A3B32]/10 flex items-center justify-center bg-[#2A3B32]/5 backdrop-blur-md shadow-[0_4px_20px_rgba(42,59,50,0.05)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="#2A3B32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 md:w-10 md:h-10"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </span>
        </div>
      </React.Fragment>
    ))}
  </>
);

export default function AntigravitySequence({ onProgress }) {
  const containerRef = useRef(null);
  const stickyContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const darkOverlayRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const imagesRef = useRef([]);

  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);
  const cardsWrapperRef = useRef(null);
  
  // Contact section refs
  const stream0Ref = useRef(null);
  const stream1Ref = useRef(null);
  const stream2Ref = useRef(null);
  const stream3Ref = useRef(null);
  const stream4Ref = useRef(null);
  const streamsContainerRef = useRef(null);
  const formRef = useRef(null);

  const titleRef = useRef(null);
  const titleH2Ref = useRef(null);
  const titlePRef = useRef(null);

  // Authentication & Routing
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuthStore();

  const handlePortalClick = () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
    } else {
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'designer') navigate('/designer/dashboard');
      else navigate('/client/dashboard');
    }
  };

  // Preload images
  useEffect(() => {
    if (framePaths.length === 0) {
      console.warn("AntigravitySequence: No images found by import.meta.glob!");
      setImagesLoaded(true);
      if (onProgress) onProgress(100);
      return;
    }

    let loadedCount = 0;
    const images = [];
    
    framePaths.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      
      const onImageReady = () => {
        loadedCount++;
        
        // Report progress back up to the Preloader
        if (onProgress) {
          onProgress(Math.round((loadedCount / framePaths.length) * 100));
        }

        if (loadedCount === framePaths.length) {
          imagesRef.current = images.filter(img => img.complete && img.naturalWidth > 0); // Keep only successfully loaded images
          setImagesLoaded(true);
        }
      };

      img.onload = onImageReady;
      img.onerror = () => {
        console.error("Failed to load frame:", src);
        onImageReady(); // Still increment to prevent infinite loading state
      };
      
      images[i] = img;
    });
  }, [onProgress]);

  // Main Animation Logic
  useEffect(() => {
    if (!imagesLoaded || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for opaque images
    const images = imagesRef.current;

    // Helper to draw an image to fill the canvas (object-fit: cover equivalent)
    const renderFrame = (index) => {
      if (!images[index]) return;
      const img = images[index];

      // Match canvas to display size
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      // Calculate object-fit cover dimensions
      const canvasRatio = cw / ch;
      const imgRatio = img.width / img.height;
      let drawW = cw;
      let drawH = ch;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        // Image is wider than canvas
        drawW = ch * imgRatio;
        offsetX = (cw - drawW) / 2;
      } else {
        // Image is taller than canvas
        drawH = cw / imgRatio;
        offsetY = (ch - drawH) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    };

    // Draw first frame immediately
    renderFrame(0);

    const playhead = { frame: 0 };
    
    // Setup GSAP Context for proper React cleanup (fixes strict mode duplicate triggers)
    let ctxGsap = gsap.context(() => {
      // Timeline for the sequence using native CSS sticky instead of GSAP pin
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom', // Scrub through the entire 400vh height
          scrub: 1.5, // Butter smooth scrubbing
        }
      });

      // Timeline mapped to 1.0 (represents the entire 800vh scroll)
      // PART 1: Cards Sequence (0 to 0.45)
      tl.to(playhead, {
        frame: images.length - 1,
        snap: 'frame',
        ease: 'none',
        onUpdate: () => renderFrame(Math.round(playhead.frame)),
        duration: 0.45
      }, 0);

      // Fade canvas out completely and set visibility hidden
      tl.to(canvas, { autoAlpha: 0, duration: 0.05, ease: 'power2.inOut' }, 0.45);

      if (titleRef.current && card1Ref.current && card2Ref.current && card3Ref.current) {
        const ease = 'expo.out';
        const duration = 0.1;
        tl.fromTo(titleRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration, ease }, 0.35);
        
        if (titleH2Ref.current && titlePRef.current) {
          tl.to(titleH2Ref.current, { color: '#E8E2DA', duration: 0.1, ease: 'power2.inOut' }, 0.35);
          tl.to(titlePRef.current, { color: 'rgba(232, 226, 218, 0.6)', duration: 0.1, ease: 'power2.inOut' }, 0.35);
        }

        tl.fromTo(card1Ref.current, { opacity: 0, y: 80, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration, ease }, 0.38);
        tl.fromTo(card2Ref.current, { opacity: 0, y: 80, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration, ease }, 0.41);
        tl.fromTo(card3Ref.current, { opacity: 0, y: 80, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration, ease }, 0.44);
      }

      // PART 2: Cards fade out completely
      tl.to(cardsWrapperRef.current, { autoAlpha: 0, scale: 0.9, duration: 0.05, ease: 'power2.in' }, 0.45);
      tl.to(darkOverlayRef.current, { autoAlpha: 0, duration: 0.05, ease: 'power2.inOut' }, 0.45);
      
      // Transition the background color from Black to #FFFDD0 gradually (0.1 represents 80vh of smooth scrolling)
      tl.to(stickyContainerRef.current, { backgroundColor: '#FFFDD0', duration: 0.1, ease: 'power1.inOut' }, 0.45);

      // PART 3: Contact Network Emerges on the CREAM screen (0.5 to 1.0)
      
      // Initial hidden states for network
      gsap.set([stream0Ref.current, stream1Ref.current, stream3Ref.current, stream4Ref.current], { opacity: 0 });
      gsap.set(stream2Ref.current, { opacity: 0 });
      gsap.set(formRef.current, { opacity: 0, scale: 0.9, y: 50, pointerEvents: 'none' });

      // Middle stream emerges
      tl.to(stream2Ref.current, { opacity: 1, duration: 0.05, ease: 'power2.inOut' }, 0.52);
      
      // Network multiplies
      tl.to([stream1Ref.current, stream3Ref.current], { opacity: 0.6, duration: 0.05, ease: 'power2.inOut' }, 0.55);
      tl.to([stream0Ref.current, stream4Ref.current], { opacity: 0.3, duration: 0.05, ease: 'power2.inOut' }, 0.6);

      // Scrub horizontally across the rest of the scroll (0.5 to 1.0)
      tl.fromTo(stream2Ref.current, { x: '10%' }, { x: '-30%', ease: 'power2.out', duration: 0.5 }, 0.5);
      tl.fromTo(stream1Ref.current, { x: '-20%' }, { x: '20%', ease: 'power2.out', duration: 0.5 }, 0.5);
      tl.fromTo(stream3Ref.current, { x: '-15%' }, { x: '25%', ease: 'power2.out', duration: 0.5 }, 0.5);
      tl.fromTo(stream0Ref.current, { x: '0%' }, { x: '-40%', ease: 'power2.out', duration: 0.5 }, 0.5);
      tl.fromTo(stream4Ref.current, { x: '5%' }, { x: '-35%', ease: 'power2.out', duration: 0.5 }, 0.5);

      // Transition into Contact Section
      tl.to(streamsContainerRef.current, { opacity: 0.05, filter: 'blur(8px)', duration: 0.1, ease: 'power2.inOut' }, 0.85);
      tl.to(formRef.current, { opacity: 1, scale: 1, y: 0, pointerEvents: 'auto', duration: 0.1, ease: 'back.out(1.5)' }, 0.9);

      // Entry animation (Phase 1 container reveal)
      gsap.fromTo(canvas, 
        { 
          scale: 0.85, 
          borderRadius: '32px',
          opacity: 0.8
        },
        {
          scale: 1,
          borderRadius: '0px',
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom', // Start when container hits bottom of viewport
            end: 'top top',      // End when container hits top (fullscreen)
            scrub: true,
          }
        }
      );
    }, containerRef);

    // Handle window resize rendering
    const handleResize = () => renderFrame(Math.round(playhead.frame));
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ctxGsap.revert(); // Clean up GSAP instances cleanly
    };
  }, [imagesLoaded]);

  return (
    <div id="about" ref={containerRef} className="relative w-full h-[800vh] bg-[#1A1210] z-30">
      <div ref={stickyContainerRef} className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-[#050505]">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full object-cover transform-gpu will-change-transform opacity-0 transition-opacity duration-1000"
          style={{ opacity: imagesLoaded ? 1 : 0 }}
        />
        
        {/* Loading State Fallback */}
        {!imagesLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-[#E3D5CA]/50 font-neuemontreal uppercase tracking-[0.2em] text-xs">
            Loading Cinematic Sequence...
          </div>
        )}
        
        {/* Subtle Dark Overlay to maintain text contrast and premium feel */}
        <div ref={darkOverlayRef} className="absolute inset-0 bg-black/10 pointer-events-none" />

        {/* Founders Tunnel Effect Overlay */}
        <div ref={cardsWrapperRef} className="absolute inset-0 z-40 flex flex-col items-center justify-center p-4 pt-24 md:pt-32 lg:p-12 lg:pt-32 pointer-events-none">
          
          <div ref={titleRef} className="text-center mb-4 lg:mb-8 opacity-0 translate-y-8">
            <h2 ref={titleH2Ref} className="font-cormorant italic text-3xl md:text-4xl lg:text-5xl text-[#1A1210] mb-1 tracking-tight">The Visionaries</h2>
            <p ref={titlePRef} className="font-neuemontreal text-[8px] md:text-[9px] font-bold uppercase tracking-[0.3em] text-[rgba(26,18,16,0.6)]">Meet the minds behind SNS Nest</p>
          </div>

          <div className="flex flex-row gap-4 lg:gap-6 w-full max-w-7xl items-stretch justify-start md:justify-center overflow-x-auto md:overflow-visible snap-x snap-mandatory px-4 md:px-0 pb-8 md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            
            {/* Card 1: Senthil */}
            <div ref={card1Ref} className="snap-center shrink-0 relative group overflow-hidden bg-[#E8E2DA]/80 backdrop-blur-2xl p-6 lg:p-8 rounded-2xl w-[85vw] md:w-1/3 text-left border border-[#1A1210]/5 shadow-2xl pointer-events-auto opacity-0 translate-y-12">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#E8E2DA]/95 pointer-events-none" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden mb-4 border border-[#1A1210]/10 shadow-[0_0_20px_rgba(26,18,16,0.1)]">
                  <img src={senthilImg} alt="Sendhil Kumar S" className="w-full h-full object-cover transition-all duration-700 scale-100 group-hover:scale-110" />
                </div>
                <h3 className="font-cormorant italic text-2xl md:text-3xl text-[#1A1210] mb-1">Sendhil Kumar S</h3>
                <p className="font-neuemontreal text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] text-[#817773] mb-3">Business Dev & Marketing</p>
                <div className="w-8 h-px bg-[#1A1210]/20 mb-3" />
                <p className="font-neuemontreal text-[11px] md:text-xs text-[#4A4340] line-clamp-3 leading-relaxed mb-6 font-medium">
                  Dedicated and results-oriented professional specializing in driving business growth, building robust client relationships, and expanding market presence through targeted strategies.
                </p>
                <div className="mt-auto">
                  <Link to="/founders" className="inline-flex items-center gap-2 text-[#1A1210] font-neuemontreal uppercase tracking-widest text-[8px] md:text-[9px] hover:opacity-70 transition-opacity">
                    <span className="border-b border-[#1A1210]/30 pb-1">Read Details</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Card 2: Narendra */}
            <div ref={card2Ref} className="snap-center shrink-0 relative group overflow-hidden bg-[#E8E2DA]/80 backdrop-blur-2xl p-6 lg:p-8 rounded-2xl w-[85vw] md:w-1/3 text-left border border-[#1A1210]/5 shadow-2xl pointer-events-auto opacity-0 translate-y-12">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#E8E2DA]/95 pointer-events-none" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden mb-4 border border-[#1A1210]/10 shadow-[0_0_20px_rgba(26,18,16,0.1)]">
                  <img src={narendraImg} alt="Narendra Reddy G N" className="w-full h-full object-cover object-top transition-all duration-700 scale-100 group-hover:scale-110" />
                </div>
                <h3 className="font-cormorant italic text-2xl md:text-3xl text-[#1A1210] mb-1">Narendra Reddy</h3>
                <p className="font-neuemontreal text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] text-[#817773] mb-3">CEO & Principal Designer</p>
                <div className="w-8 h-px bg-[#1A1210]/20 mb-3" />
                <p className="font-neuemontreal text-[11px] md:text-xs text-[#4A4340] line-clamp-3 leading-relaxed mb-6 font-medium">
                  Driven by the balance of aesthetic elegance and structural practicality, turning floor plans into sanctuaries that reflect the true personality of inhabitants.
                </p>
                <div className="mt-auto">
                  <Link to="/founders" className="inline-flex items-center gap-2 text-[#1A1210] font-neuemontreal uppercase tracking-widest text-[8px] md:text-[9px] hover:opacity-70 transition-opacity">
                    <span className="border-b border-[#1A1210]/30 pb-1">Read Details</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 3: Sreenivas */}
            <div ref={card3Ref} className="snap-center shrink-0 relative group overflow-hidden bg-[#E8E2DA]/80 backdrop-blur-2xl p-6 lg:p-8 rounded-2xl w-[85vw] md:w-1/3 text-left border border-[#1A1210]/5 shadow-2xl pointer-events-auto opacity-0 translate-y-12">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#E8E2DA]/95 pointer-events-none" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden mb-4 border border-[#1A1210]/10 shadow-[0_0_20px_rgba(26,18,16,0.1)]">
                  <img src={sreenivasImg} alt="S Sreenivasulu" className="w-full h-full object-cover transition-all duration-700 scale-100 group-hover:scale-110" />
                </div>
                <h3 className="font-cormorant italic text-2xl md:text-3xl text-[#1A1210] mb-1">S Sreenivasulu</h3>
                <p className="font-neuemontreal text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] text-[#817773] mb-3">Interior Designer & VM</p>
                <div className="w-8 h-px bg-[#1A1210]/20 mb-3" />
                <p className="font-neuemontreal text-[11px] md:text-xs text-[#4A4340] line-clamp-3 leading-relaxed mb-6 font-medium">
                  Passionate about crafting elegant, functional, and contemporary spaces. Driven by the philosophy that design creates spaces inspiring comfort, productivity, and happiness.
                </p>
                <div className="mt-auto">
                  <Link to="/founders" className="inline-flex items-center gap-2 text-[#1A1210] font-neuemontreal uppercase tracking-widest text-[8px] md:text-[9px] hover:opacity-70 transition-opacity">
                    <span className="border-b border-[#1A1210]/30 pb-1">Read Details</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTION LAYER: CONTACT NETWORK STREAM                                 */}
        {/* ========================================================================= */}
        <div ref={streamsContainerRef} className="absolute inset-0 z-50 flex flex-col justify-between py-12 md:py-24 -ml-[50vw] w-[200vw] pointer-events-none">
          <div ref={stream0Ref} className="flex items-center w-max will-change-transform"><StreamContent /></div>
          <div ref={stream1Ref} className="flex items-center w-max will-change-transform"><StreamContent /></div>
          <div ref={stream2Ref} className="flex items-center w-max will-change-transform z-10 scale-110 md:scale-125"><StreamContent /></div>
          <div ref={stream3Ref} className="flex items-center w-max will-change-transform"><StreamContent /></div>
          <div ref={stream4Ref} className="flex items-center w-max will-change-transform"><StreamContent /></div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTION LAYER: CONTACT CONTENT REVEAL                                 */}
        {/* ========================================================================= */}
        <div ref={formRef} className="absolute inset-0 z-50 flex flex-col items-center justify-center w-full px-4 pointer-events-none">
          <div className="w-full max-w-4xl relative flex flex-col items-center justify-center pointer-events-auto mt-16 md:mt-20">
            
            {/* Title & Conditional Prompt */}
            <div className="text-center relative z-10 mb-8 max-w-3xl mx-auto">
              {isAuthenticated ? (
                <>
                  <h2 className="font-cormorant italic text-3xl md:text-4xl lg:text-5xl text-[#2A3B32] mb-4 drop-shadow-sm leading-tight">
                    "Every great design begins with an even better story."
                  </h2>
                  <p className="font-neuemontreal text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-[#2A3B32]/50">
                    Welcome back. Access your exclusive portal
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-cormorant italic text-5xl md:text-6xl lg:text-7xl text-[#2A3B32] mb-4 drop-shadow-sm">
                    Let's Connect
                  </h2>
                  <p className="font-neuemontreal text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-[#2A3B32]/50">
                    Sign in to explore your spaces
                  </p>
                </>
              )}
            </div>

            {/* Action Button */}
            <button 
              onClick={handlePortalClick} 
              className="relative overflow-hidden group border border-[#2A3B32]/20 rounded-full px-10 py-3.5 md:px-12 md:py-4 mb-10 flex items-center justify-center gap-4 transition-all duration-300 hover:scale-105 hover:border-[#2A3B32]/40 bg-[#2A3B32]/5 backdrop-blur-md shadow-[0_4px_20px_rgba(42,59,50,0.05)] cursor-pointer z-10"
            >
              {/* Hover Fill Background (Bottom to Top) */}
              <div className="absolute inset-0 bg-[#2A3B32] origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] -z-10" />

              <span className="font-neuemontreal text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#2A3B32] group-hover:text-white transition-colors duration-300">
                {isAuthenticated ? "Access Portal" : "Login Portal"}
              </span>
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#2A3B32] group-hover:text-white transform group-hover:translate-x-1.5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            {/* Social Icons Row */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-12 relative z-10">
              {/* LINKEDIN */}
              <a href="#" className="relative overflow-hidden group z-10 w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#2A3B32]/15 flex items-center justify-center bg-[#2A3B32]/5 backdrop-blur-md shadow-[0_2px_10px_rgba(42,59,50,0.05)]">
                <div className="absolute inset-0 bg-[#2A3B32] origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] -z-10" />
                <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5 fill-[#2A3B32] group-hover:fill-white transition-colors duration-300"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              {/* INSTAGRAM */}
              <a href="#" className="relative overflow-hidden group z-10 w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#2A3B32]/15 flex items-center justify-center bg-[#2A3B32]/5 backdrop-blur-md shadow-[0_2px_10px_rgba(42,59,50,0.05)]">
                <div className="absolute inset-0 bg-[#2A3B32] origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] -z-10" />
                <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5 fill-[#2A3B32] group-hover:fill-white transition-colors duration-300"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              {/* WHATSAPP */}
              <a href="#" className="relative overflow-hidden group z-10 w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#2A3B32]/15 flex items-center justify-center bg-[#2A3B32]/5 backdrop-blur-md shadow-[0_2px_10px_rgba(42,59,50,0.05)]">
                <div className="absolute inset-0 bg-[#2A3B32] origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] -z-10" />
                <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5 fill-[#2A3B32] group-hover:fill-white transition-colors duration-300"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.88-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              </a>
              {/* FACEBOOK */}
              <a href="#" className="relative overflow-hidden group z-10 w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#2A3B32]/15 flex items-center justify-center bg-[#2A3B32]/5 backdrop-blur-md shadow-[0_2px_10px_rgba(42,59,50,0.05)]">
                <div className="absolute inset-0 bg-[#2A3B32] origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] -z-10" />
                <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5 fill-[#2A3B32] group-hover:fill-white transition-colors duration-300"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
              {/* PHONE */}
              <a href="#" className="relative overflow-hidden group z-10 w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#2A3B32]/15 flex items-center justify-center bg-[#2A3B32]/5 backdrop-blur-md shadow-[0_2px_10px_rgba(42,59,50,0.05)]">
                <div className="absolute inset-0 bg-[#2A3B32] origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] -z-10" />
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-5 md:h-5 stroke-[#2A3B32] group-hover:stroke-white transition-colors duration-300"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </a>
            </div>

            {/* Historic Footer Separator & Copyright */}
            <div className="w-full flex flex-col items-center opacity-70">
              <svg width="250" height="20" viewBox="0 0 250 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#2A3B32] mb-6 drop-shadow-sm">
                <path d="M125 10 C 100 -5, 75 25, 25 10" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <path d="M125 10 C 150 -5, 175 25, 225 10" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <circle cx="125" cy="10" r="3" fill="currentColor" />
                <circle cx="25" cy="10" r="1.5" fill="currentColor" />
                <circle cx="225" cy="10" r="1.5" fill="currentColor" />
                <path d="M115 10 Q 120 5 125 10 Q 120 15 115 10 Z" fill="currentColor" />
                <path d="M135 10 Q 130 5 125 10 Q 130 15 135 10 Z" fill="currentColor" />
              </svg>
              
              <p className="font-neuemontreal text-[9px] md:text-[10px] tracking-widest uppercase text-[#2A3B32]/70 text-center font-bold">
                © {new Date().getFullYear()} SNS-NEST LTD. ALL RIGHTS RESERVED.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
