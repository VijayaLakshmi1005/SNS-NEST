import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import loadingVideo from '../../Assets/Spinning_top_animation.mp4';

export default function Preloader({ progress, onComplete }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const contentRef = useRef(null);
  const startTime = useRef(Date.now());
  const [isVideoReady, setIsVideoReady] = useState(false);

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
    // Basic entrance animation - ONLY trigger when the video frame is fully loaded
    if (isVideoReady && contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: 'power3.out' }
      );
    }
  }, [isVideoReady]);

  useEffect(() => {
    // When progress hits 100, ensure the screen has been visible for at least 3.5 seconds
    if (progress === 100) {
      const elapsed = Date.now() - startTime.current;
      const remainingWait = Math.max(0, 3500 - elapsed);
      const delayInSeconds = remainingWait / 1000;

      const tl = gsap.timeline({
        delay: delayInSeconds,
        onComplete: onComplete
      });

      // "Pro" cinematic exit: Slide the entire screen up like a curtain, 
      // while pushing the inner content down slightly for a premium parallax effect. No basic fade outs!
      tl.to(containerRef.current, {
        yPercent: -100,
        duration: 1.2,
        ease: 'expo.inOut'
      })
      .to(contentRef.current, {
        yPercent: 40, // Premium parallax effect
        duration: 1.2,
        ease: 'expo.inOut'
      }, "<"); // Execute at the exact same time
    }
  }, [progress, onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-[#E8E2DA] flex flex-col items-center justify-center pointer-events-none overflow-hidden"
    >
      {/* Wrapper to animate both text and video together. Opacity 0 initially to prevent text flashing early */}
      <div ref={contentRef} className="absolute inset-0 w-full h-full opacity-0">
        
        <video 
          ref={videoRef}
          src={loadingVideo}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setIsVideoReady(true)}
          className="absolute inset-0 w-full h-full object-cover scale-[1.20] sm:scale-[1.25] md:scale-[1.30] lg:scale-[1.35] z-0" 
        />

        {/* Huge cinematic text placed ON TOP of the video, but using mix-blend-overlay.
            This CSS trick makes the black text disappear into the white highlights and dark shadows of the spinning top,
            creating the perfect optical illusion that it is being blocked by the physical top! */}
        <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] md:-translate-y-[55%] font-clash font-bold uppercase text-[18vw] md:text-[14vw] lg:text-[12vw] xl:text-[10rem] tracking-[0.15em] md:tracking-[0.2em] text-black opacity-80 mix-blend-overlay z-10 select-none text-center leading-none whitespace-nowrap">
          LOADING
        </h1>

      </div>
    </div>
  );
}
