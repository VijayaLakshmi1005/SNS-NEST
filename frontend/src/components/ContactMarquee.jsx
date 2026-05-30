import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const StreamContent = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <React.Fragment key={i}>
        {/* LOGO */}
        <div className="flex items-center gap-4 opacity-90 mx-8">
          <span className="font-nav-style font-extrabold tracking-[0.3em] uppercase text-4xl md:text-5xl lg:text-6xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
            SNS NEST
          </span>
        </div>
        
        {/* LINKEDIN */}
        <div className="flex items-center mx-8 opacity-80">
          <span className="w-16 h-16 md:w-24 md:h-24 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          </span>
        </div>

        {/* INSTAGRAM */}
        <div className="flex items-center mx-8 opacity-80">
          <span className="w-16 h-16 md:w-24 md:h-24 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </span>
        </div>

        {/* WHATSAPP */}
        <div className="flex items-center mx-8 opacity-80">
          <span className="w-16 h-16 md:w-24 md:h-24 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.88-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          </span>
        </div>

        {/* FACEBOOK */}
        <div className="flex items-center mx-8 opacity-80">
          <span className="w-16 h-16 md:w-24 md:h-24 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
          </span>
        </div>

        {/* PHONE */}
        <div className="flex items-center mx-8 opacity-80">
          <span className="w-16 h-16 md:w-24 md:h-24 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </span>
        </div>
      </React.Fragment>
    ))}
  </>
);

export default function ContactMarquee() {
  const containerRef = useRef(null);
  
  const stream0Ref = useRef(null);
  const stream1Ref = useRef(null);
  const stream2Ref = useRef(null); // The primary middle stream
  const stream3Ref = useRef(null);
  const stream4Ref = useRef(null);

  const streamsContainerRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5, // Buttery smooth scrubbing
        }
      });

      // Initial state: Only middle stream (stream2) starts fading in
      gsap.set([stream0Ref.current, stream1Ref.current, stream3Ref.current, stream4Ref.current], { opacity: 0 });
      gsap.set(stream2Ref.current, { opacity: 0 });
      gsap.set(formRef.current, { opacity: 0, scale: 0.9, y: 50, pointerEvents: 'none' });

      // PHASE 1: Middle stream emerges and starts moving
      tl.to(stream2Ref.current, { opacity: 1, duration: 0.1, ease: 'power2.inOut' }, 0);
      
      // PHASE 2 & 3: Network multiplies. Other streams fade in gradually.
      tl.to([stream1Ref.current, stream3Ref.current], { opacity: 0.6, duration: 0.2, ease: 'power2.inOut' }, 0.15);
      tl.to([stream0Ref.current, stream4Ref.current], { opacity: 0.3, duration: 0.2, ease: 'power2.inOut' }, 0.25);

      // Continuous movement logic for streams: 
      // All streams scrub horizontally across the scroll duration, decelerating beautifully.
      tl.fromTo(stream2Ref.current, { x: '10%' }, { x: '-30%', ease: 'power2.out', duration: 0.8 }, 0);
      tl.fromTo(stream1Ref.current, { x: '-20%' }, { x: '20%', ease: 'power2.out', duration: 0.8 }, 0); // Opposing
      tl.fromTo(stream3Ref.current, { x: '-15%' }, { x: '25%', ease: 'power2.out', duration: 0.8 }, 0); // Opposing
      tl.fromTo(stream0Ref.current, { x: '0%' }, { x: '-40%', ease: 'power2.out', duration: 0.8 }, 0);
      tl.fromTo(stream4Ref.current, { x: '5%' }, { x: '-35%', ease: 'power2.out', duration: 0.8 }, 0);

      // PHASE 4 & 5: Transition into Contact Section
      // Streams gently blur and darken into the abyss
      tl.to(streamsContainerRef.current, { opacity: 0.05, filter: 'blur(8px)', duration: 0.3, ease: 'power2.inOut' }, 0.65);
      
      // Contact form scales up from center, locking in
      tl.to(formRef.current, { opacity: 1, scale: 1, y: 0, pointerEvents: 'auto', duration: 0.35, ease: 'back.out(1.5)' }, 0.65);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div id="contact" ref={containerRef} className="relative w-full h-[400vh] bg-black z-40">
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-black">
        
        {/* Network Streams Container */}
        <div ref={streamsContainerRef} className="absolute inset-0 flex flex-col justify-between py-12 md:py-24 -ml-[50vw] w-[200vw] pointer-events-none">
          
          <div ref={stream0Ref} className="flex items-center w-max will-change-transform">
            <StreamContent />
          </div>

          <div ref={stream1Ref} className="flex items-center w-max will-change-transform">
            <StreamContent />
          </div>

          <div ref={stream2Ref} className="flex items-center w-max will-change-transform z-10 scale-110 md:scale-125">
            <StreamContent />
          </div>

          <div ref={stream3Ref} className="flex items-center w-max will-change-transform">
            <StreamContent />
          </div>

          <div ref={stream4Ref} className="flex items-center w-max will-change-transform">
            <StreamContent />
          </div>

        </div>

        {/* Contact Form Reveal (Apple x Linear aesthetic) */}
        <div ref={formRef} className="relative z-50 flex flex-col items-center justify-center w-full max-w-4xl px-4 pointer-events-none">
          <div className="bg-black/40 backdrop-blur-3xl border border-white/10 p-8 md:p-12 lg:p-16 rounded-3xl shadow-[0_0_80px_rgba(255,255,255,0.05)] w-full relative overflow-hidden">
            
            {/* Subtle inner glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-24 bg-white/5 blur-3xl rounded-full" />

            <div className="text-center mb-10 md:mb-12 relative z-10">
              <h2 className="font-cormorant italic text-4xl md:text-5xl lg:text-6xl text-white mb-3">Let's Connect</h2>
              <p className="font-neuemontreal text-xs md:text-sm font-medium tracking-widest uppercase text-white/50">Start a conversation with SNS Nest</p>
            </div>

            <form className="flex flex-col gap-6 relative z-10 w-full max-w-2xl mx-auto" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-neuemontreal text-[10px] uppercase tracking-widest text-white/40 ml-2">Name</label>
                  <input type="text" className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm font-neuemontreal placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors" placeholder="John Doe" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-neuemontreal text-[10px] uppercase tracking-widest text-white/40 ml-2">Email</label>
                  <input type="email" className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm font-neuemontreal placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors" placeholder="john@example.com" />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="font-neuemontreal text-[10px] uppercase tracking-widest text-white/40 ml-2">Message</label>
                <textarea rows="4" className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm font-neuemontreal placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors resize-none" placeholder="Tell us about your space..." />
              </div>

              <button className="mt-4 w-full md:w-auto md:mx-auto bg-white text-black font-neuemontreal text-xs font-bold uppercase tracking-[0.2em] px-12 py-5 rounded-full hover:bg-[#E8E2DA] hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Send Message
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-6 md:gap-12 text-white/50 font-neuemontreal text-[10px] tracking-widest uppercase">
              <span className="hover:text-white transition-colors cursor-pointer">hello@snsnest.com</span>
              <span className="hidden md:inline">•</span>
              <span className="hover:text-white transition-colors cursor-pointer">+91 9988776655</span>
              <span className="hidden md:inline">•</span>
              <span className="hover:text-white transition-colors cursor-pointer">Chennai, India</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
