import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Eagerly load all image frames. Keys will be the file paths, so we sort them to ensure correct sequence.
const modules = import.meta.glob('../../Assets/webp/*.webp', { eager: true });
const framePaths = Object.keys(modules)
  .sort()
  .map(key => modules[key].default || modules[key]);

export default function AntigravitySequence({ onProgress }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const imagesRef = useRef([]);

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

      // Animate frames exactly to scroll
      tl.to(playhead, {
        frame: images.length - 1,
        snap: 'frame',
        ease: 'none',
        onUpdate: () => renderFrame(Math.round(playhead.frame))
      }, 0);

      // Entry animation (Phase 2): As it scrolls into view, scale up and remove border radius
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
    <div ref={containerRef} className="relative w-full h-[400vh] bg-[#1A1210] z-30">
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
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
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </div>
    </div>
  );
}
