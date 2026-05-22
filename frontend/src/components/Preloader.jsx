import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Preloader({ progress, onComplete }) {
  const containerRef = useRef(null);
  const numberRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    // Basic text entrance animation
    gsap.fromTo(
      [textRef.current, numberRef.current],
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out' }
    );
  }, []);

  useEffect(() => {
    // When progress hits 100, wait a split second then do the cinematic exit
    if (progress === 100) {
      const tl = gsap.timeline({
        onComplete: onComplete
      });

      // Split open / Slide up exit animation
      tl.to([textRef.current, numberRef.current], {
        y: -50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.inOut'
      })
      .to(containerRef.current, {
        yPercent: -100, // Slide the entire black screen up
        duration: 1.2,
        ease: 'expo.inOut'
      }, '-=0.4');
    }
  }, [progress, onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-[#1A1210] flex flex-col items-center justify-center pointer-events-none"
    >
      <div className="flex flex-col items-center justify-center overflow-hidden">
        <h1 
          ref={textRef} 
          className="text-[#E3D5CA]/50 font-neuemontreal uppercase tracking-[0.4em] text-xs md:text-sm mb-4"
        >
          Loading Architectural Assets
        </h1>
        <div 
          ref={numberRef} 
          className="text-[#E3D5CA] font-neuemontreal text-7xl md:text-9xl font-light tracking-tighter"
        >
          {progress}%
        </div>
      </div>
    </div>
  );
}
