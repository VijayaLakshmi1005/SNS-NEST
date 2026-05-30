import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import senthilImg from '../../Assets/senthil.jpeg';
import sreenivasImg from '../../Assets/sreenivas.jpeg';
import narendraImg from '../../Assets/nerendra.jpeg';
import paperTexture from '../../Assets/paper_texture.png';
import logoImg from '../../Assets/logo.png';

gsap.registerPlugin(ScrollTrigger);

export default function Founders() {
  const containerRef = useRef(null);
  const location = useLocation();
  
  // Scroll to hash or top on mount and init animations
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const el = document.querySelector(location.hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 500); // Wait for GSAP layout to settle
    } else {
      window.scrollTo(0, 0);
    }
    
    let ctx = gsap.context(() => {
      const sections = gsap.utils.toArray('.founder-section');
      
      sections.forEach((section) => {
        const imgContainer = section.querySelector('.img-container');
        const textContent = section.querySelector('.text-content');
        
        // Image Parallax / Slide up
        gsap.fromTo(imgContainer, 
          { y: 100, opacity: 0 },
          { 
            y: 0, opacity: 1, 
            duration: 1.2, 
            ease: 'expo.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
            }
          }
        );
        
        // Text slide up with stagger
        gsap.fromTo(textContent.children,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1,
            duration: 1,
            stagger: 0.1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
            }
          }
        );
      });
      
      // Header and title animation
      gsap.fromTo('.page-title', 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, ease: 'expo.out', delay: 0.2 }
      );
      
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen text-[#1A1210] font-nav-style pb-32"
      style={{
        backgroundColor: '#E8E2DA',
        backgroundImage: `url(${paperTexture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Fixed Navigation Elements */}
      {/* Top Left Logo & Company Name (Matches Navbar) */}
      <div className="absolute top-[20px] left-4 md:top-[44px] md:left-12 z-50 pointer-events-auto">
        <Link to="/" className="flex items-center lg:items-start gap-2 sm:gap-2.5 outline-none hover:opacity-80 transition-opacity duration-300">
          <img
            src={logoImg}
            alt="SNS Nest Logo"
            className="h-8 sm:h-10 md:h-12 w-auto object-contain transition-all duration-300 mt-0 lg:mt-[2px]"
          />
          <div className="font-nav-style leading-none flex flex-col items-start mt-0 lg:mt-[4px] transition-colors duration-300 ease-in-out text-[#1A1210]">
            <span className="text-sm sm:text-base font-extrabold tracking-wider">SNS NEST</span>
            <span className="text-[5px] sm:text-[6.5px] font-normal tracking-wider opacity-80 uppercase mt-px">
              Find & Design Solutions
            </span>
          </div>
        </Link>
      </div>

      {/* Top Right Breadcrumb/Return Button */}
      <div className="absolute top-[20px] right-4 md:top-[44px] md:right-12 z-50 pointer-events-auto">
        <Link 
          to="/#about" 
          className="flex items-center gap-3 bg-[#E8E2DA]/50 backdrop-blur-md py-2 px-4 rounded-full border border-[#1A1210]/10 hover:bg-[#1A1210]/5 transition-all duration-300 group shadow-sm text-[#1A1210]"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span className="font-neuemontreal font-bold tracking-widest text-[10px] uppercase">Return</span>
        </Link>
      </div>

      <main className="max-w-6xl mx-auto px-6 md:px-12 pt-24 md:pt-48 space-y-20 md:space-y-48">
        
        {/* Title */}
        <div className="page-title text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-[80px] font-cormorant italic tracking-tight text-[#1A1210] leading-none">
            The Visionaries
          </h1>
          <div className="w-24 h-px bg-[#1A1210]/30 mx-auto" />
          <p className="font-neuemontreal text-sm md:text-base text-[#4A4340] uppercase tracking-[0.2em] font-medium">
            Meet the minds behind SNS NEST
          </p>
        </div>

        {/* Senthil */}
        <section id="senthil" className="founder-section flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
          <div className="img-container w-full lg:w-5/12 aspect-[3/4] md:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(26,18,16,0.15)] relative group">
            <img 
              src={senthilImg} 
              alt="Sendhil Kumar S" 
              className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[#1A1210]/5 mix-blend-overlay pointer-events-none" />
          </div>
          <div className="text-content w-full lg:w-7/12 space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-cormorant italic tracking-tight text-[#1A1210] mb-2">Sendhil Kumar S</h2>
              <p className="text-[#817773] font-neuemontreal uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold">Founder, Business Development & Marketing</p>
            </div>
            <div className="w-16 h-px bg-[#1A1210]/20" />
            <div className="space-y-6 font-nav-style text-sm md:text-base text-[#4A4340] leading-relaxed font-light">
              <div>
                <h3 className="font-neuemontreal font-bold text-[#1A1210] uppercase tracking-widest text-[10px] mb-2">Professional Summary</h3>
                <p>
                  Dedicated and results-oriented Business Development Associate and Marketing Professional with a proven track record in driving business growth, building robust client relationships, and executing targeted marketing strategies. Combining strategic thinking with a customer-centric approach, I specialize in expanding market presence, generating high-quality leads, and delivering long-term organizational success.
                </p>
              </div>
              <div>
                <h3 className="font-neuemontreal font-bold text-[#1A1210] uppercase tracking-widest text-[10px] mb-2">Career Objective</h3>
                <p>
                  To leverage my expertise in business development, strategic marketing, and client relationship management to drive revenue growth for a dynamic organization while continuously evolving as a professional leader.
                </p>
              </div>
              <div>
                <h3 className="font-neuemontreal font-bold text-[#1A1210] uppercase tracking-widest text-[10px] mb-2">Core Competencies</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                  <li className="flex gap-2"><span className="text-[#817773]">-</span> <span>Lead Generation & Sales</span></li>
                  <li className="flex gap-2"><span className="text-[#817773]">-</span> <span>Strategic Partnerships</span></li>
                  <li className="flex gap-2"><span className="text-[#817773]">-</span> <span>Digital Marketing & Branding</span></li>
                  <li className="flex gap-2"><span className="text-[#817773]">-</span> <span>Client Relationship Management</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Narendra */}
        <section id="narendra" className="founder-section flex flex-col lg:flex-row-reverse gap-12 lg:gap-24 items-center">
          <div className="img-container w-full lg:w-5/12 aspect-[3/4] md:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(26,18,16,0.15)] relative group">
            <img 
              src={narendraImg} 
              alt="Narendra Reddy G N" 
              className="w-full h-full object-cover object-top transition-transform duration-[1.5s] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[#1A1210]/5 mix-blend-overlay pointer-events-none" />
          </div>
          <div className="text-content w-full lg:w-7/12 space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-cormorant italic tracking-tight text-[#1A1210] mb-2">Narendra Reddy G N</h2>
              <p className="text-[#817773] font-neuemontreal uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold">B.E., M.Tech • Founder, CEO & Principal Designer</p>
            </div>
            <div className="w-16 h-px bg-[#1A1210]/20" />
            <div className="space-y-6 font-nav-style text-sm md:text-base text-[#4A4340] leading-relaxed font-light">
              <div>
                <h3 className="font-neuemontreal font-bold text-[#1A1210] uppercase tracking-widest text-[10px] mb-2">My Passion: Crafting More Than Just Spaces</h3>
                <p>
                  For me, interior design is not about filling a room with furniture; it is about understanding how people live, interact, and feel within their walls. My passion lies in the art of functional transformation—taking a blank floor plan or a complex residential layout and turning it into a sanctuary that reflects the true personality of its inhabitants.
                </p>
                <p className="mt-3">
                  I am driven by the fine balance between aesthetic elegance and structural practicality. Whether it is the technical precision of a 3D model or the tactile selection of materials, my joy comes from the details. I believe that a home is the ultimate reflection of one's life journey.
                </p>
              </div>
              
              <div>
                <h3 className="font-neuemontreal font-bold text-[#1A1210] uppercase tracking-widest text-[10px] mb-2">My Vision: Elevating Living</h3>
                <p>
                  My vision is to build a design practice recognized for its integrity, innovation, and client-centric approach, effectively bridging the gap between high-end, contemporary design concepts and real-world execution.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sreenivas */}
        <section id="sreenivas" className="founder-section flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
          <div className="img-container w-full lg:w-5/12 aspect-[3/4] md:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(26,18,16,0.15)] relative group">
            <img 
              src={sreenivasImg} 
              alt="S Sreenivasulu" 
              className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[#1A1210]/5 mix-blend-overlay pointer-events-none" />
          </div>
          <div className="text-content w-full lg:w-7/12 space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-cormorant italic tracking-tight text-[#1A1210] mb-2">S Sreenivasulu</h2>
              <p className="text-[#817773] font-neuemontreal uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold">Founder, Interior Designer, VM</p>
            </div>
            <div className="w-16 h-px bg-[#1A1210]/20" />
            <div className="space-y-6 font-nav-style text-sm md:text-base text-[#4A4340] leading-relaxed font-light">
              <div>
                <h3 className="font-neuemontreal font-bold text-[#1A1210] uppercase tracking-widest text-[10px] mb-2">About Me</h3>
                <p>
                  I am a passionate Interior Designer dedicated to crafting elegant, functional, and contemporary spaces that reflect your unique style and personality. Combining a sharp eye for detail with strategic space planning, I specialize in transforming residential and commercial interiors into inspiring environments. My approach blends creative vision with client-focused execution.
                </p>
              </div>
              <div>
                <h3 className="font-neuemontreal font-bold text-[#1A1210] uppercase tracking-widest text-[10px] mb-2">Design Philosophy</h3>
                <blockquote className="font-cormorant italic text-2xl md:text-3xl text-[#1A1210] border-l-2 border-[#817773] pl-6 my-6 leading-snug">
                  "Design is not just about decoration — it is about creating spaces that inspire comfort, productivity, and happiness."
                </blockquote>
                <p>
                  I believe every space has a story to tell. My goal is to design interiors that align perfectly with my clients' lifestyles while maintaining elegance, simplicity, and peak functionality.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
