import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import loadingVideo from '../../Assets/Spinning_top_animation.mp4';
import paperTexture from '../../Assets/paper_texture.png';

export default function Preloader({ progress, onComplete }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const contentRef = useRef(null);
  const startTime = useRef(Date.now());
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [globalAssetsLoaded, setGlobalAssetsLoaded] = useState(false);

  // Global Asset Preloading
  useEffect(() => {
    const checkAssets = async () => {
      // 1. Wait for DOM and standard assets (images, stylesheets)
      if (document.readyState !== 'complete') {
        await new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
      }
      // 2. Wait for all custom fonts to finish loading
      if (document.fonts) {
        await document.fonts.ready;
      }
      setGlobalAssetsLoaded(true);
    };
    checkAssets();
  }, []);

  useEffect(() => {
    // Fast play the video
    if (videoRef.current) {
      videoRef.current.playbackRate = 2.0;
      // If the video is already loaded from cache before the event listener attaches
      if (videoRef.current.readyState >= 3) {
        setIsVideoReady(true);
      }
    }
  }, []);

  useEffect(() => {
    // When Antigravity sequence hits 100%, AND all global assets/fonts are loaded, AND video is ready
    if (progress === 100 && globalAssetsLoaded && isVideoReady) {
      const elapsed = Date.now() - startTime.current;
      // Enforce a strict minimum 4-second display time as mandated
      const remainingWait = Math.max(0, 4000 - elapsed);

      // Instant exit without any fadeout or sliding effects, as requested
      setTimeout(() => {
        if (onComplete) onComplete();
      }, remainingWait);
    }
  }, [progress, globalAssetsLoaded, isVideoReady, onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-[#E8E2DA] flex flex-col items-center justify-center pointer-events-none overflow-hidden"
      style={{
        backgroundImage: `url(${paperTexture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Wrapper containing text and video. Opacity is strictly 0 until the video is fully loaded. 
          Uses flexbox to mathematically center both elements. Added px-4 so it doesn't touch edges on tiny phones. */}
      <div ref={contentRef} className="absolute inset-0 w-full h-full flex items-center justify-center px-4" style={{ opacity: isVideoReady ? 1 : 0 }}>
        
        {/* The video is placed back as absolute fullscreen to prevent any hard edges from showing on wide desktop monitors.
            It uses object-contain on mobile with a scale to stay proportional, and object-cover on desktop. */}
        <video 
          ref={videoRef}
          src={loadingVideo}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setIsVideoReady(true)}
          className="absolute inset-0 w-full h-full object-contain md:object-cover scale-[1.4] md:scale-100 z-0 mix-blend-darken" 
        />

        {/* Elegant Cinematic Placement: Moved to the bottom right corner so the spinning top takes center stage. 
            Includes a retro blinking cursor to match the VT323 font theme perfectly. */}
        <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 xl:bottom-16 xl:right-16 z-10 flex items-center gap-2 md:gap-3 xl:gap-4 select-none">
          <h1 className="font-retro uppercase text-[clamp(1.2rem,4vw,3.5rem)] tracking-[0.1em] text-black drop-shadow-sm leading-none">
            LOADING...
          </h1>
          <div className="w-[8px] h-[18px] md:w-[12px] md:h-[26px] xl:w-[16px] xl:h-[36px] bg-black animate-terminal-blink" />
        </div>

      </div>
    </div>
  );
}
