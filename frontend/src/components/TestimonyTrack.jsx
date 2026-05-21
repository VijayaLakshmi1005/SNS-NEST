import React, { forwardRef } from 'react'
import testimonySlide1Img from '../../Assets/testimonyslide1.png'
import testimonySlide2Img from '../../Assets/testimonyslide2.png'
import testimonySlide3Img from '../../Assets/testimonyslide3.png'
import testimonySlide4Img from '../../Assets/testimonyslide4.png'
import testimonySlide5Img from '../../Assets/testimonyslide5.png'
import dayHeroImg from '../../Assets/Dayhero.png'
import nightHeroImg from '../../Assets/Nighthero.png'
import mobDayHeroImg from '../../Assets/MOBday.png'
import mobNightHeroImg from '../../Assets/MOBnight.png'

const TestimonyTrack = forwardRef(({
  isNight,
  scrollProgress,
  testimonyBgColor,
  reviews
}, ref) => {
  return (
    <div ref={ref} className="flex flex-row items-center h-full will-change-transform relative z-10">

      {/* SLIDE 0: HERO BANNER SECTION (rising navy backdrop, then X-axis panel slides out) */}
      <div className="w-screen h-screen mobile-dvh flex-shrink-0 relative z-20 flex flex-col items-center justify-center" style={{ backgroundColor: testimonyBgColor, transition: 'background-color 0.1s linear' }}>
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
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out hidden lg:block z-0 ${isNight ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Mobile Day Hero Image */}
        <img
          src={mobDayHeroImg}
          alt="SNS Nest Mobile Day Banner"
          className="absolute inset-0 w-full h-full object-cover scale-[1.02] block lg:hidden z-0"
        />

        {/* Mobile Night Hero Image */}
        <img
          src={mobNightHeroImg}
          alt="SNS Nest Mobile Night Banner"
          className={`absolute inset-0 w-full h-full object-cover scale-[1.02] transition-opacity duration-1000 ease-in-out block lg:hidden z-0 ${isNight ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Deep Sage Rising Backdrop (Slides bottom-to-top behind text) */}
        <div
          className="absolute inset-y-0 left-0 w-[calc(100%+8px)] z-5 will-change-transform overflow-hidden"
          style={{
            backgroundColor: testimonyBgColor,
            transform: `translateY(${Math.max(0, (1 - scrollProgress * 3.33) * 100)}%)`,
            transition: 'background-color 0.1s linear'
          }}
        >
          <img
            src={testimonySlide1Img}
            alt="Testimony Slide 1 Background"
            className="absolute inset-0 w-full h-full object-contain scale-100 sm:scale-110 lg:scale-120 translate-y-6 sm:translate-y-8 lg:translate-y-12 z-0 select-none pointer-events-none"
          />
        </div>
      </div>

      {/* REVIEW 1: Floating typography, aligned top-left */}
      <div className="w-screen lg:w-[40vw] h-screen flex-shrink-0 flex flex-col justify-center items-start pl-[8vw] pr-[6vw] lg:pr-0 relative z-10 -ml-[8px]" style={{ backgroundColor: testimonyBgColor, transition: 'background-color 0.1s linear' }}>
        {/* Desktop Architectural Pin */}
        <div className="absolute lg:top-[24.5vh] top-1/2 lg:translate-y-0 -translate-y-1/2 left-[calc(3vw-24px)] flex items-center select-none pointer-events-none z-20 lg:hidden">
          <div className="relative flex items-center justify-center w-6 h-6">
            <div className="absolute w-full h-full rounded-full border border-[#E3D5CA]/20 animate-ping opacity-75 [animation-duration:3s]" />
            <div className="absolute w-4 h-4 rounded-full border border-[#E3D5CA]/35" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#E3D5CA] shadow-[0_0_8px_rgba(227,213,202,0.8)]" />
          </div>
          <div className="w-[5vw] h-[1px] bg-[#E3D5CA]/25" />
        </div>

        {/* Text block with left border */}
        <div className="border-l lg:border-l-0 border-[#E3D5CA]/20 pl-6 sm:pl-8 lg:pl-10 py-2 lg:py-0 lg:pt-8 lg:pb-12 relative z-10 max-w-[85vw] lg:max-w-lg">
          {/* Desktop Architectural Pin & Lines (Desktop only) */}
          <div className="hidden lg:block absolute right-full top-0 w-[5vw] pointer-events-none select-none z-20">
            {/* Concentric Circle Pin */}
            <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6">
              <div className="absolute w-full h-full rounded-full border border-[#E3D5CA]/20 animate-ping opacity-75 [animation-duration:3s]" />
              <div className="absolute w-4 h-4 rounded-full border border-[#E3D5CA]/35" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#E3D5CA] shadow-[0_0_8px_rgba(227,213,202,0.8)]" />
            </div>
            {/* Horizontal Line extending past vertical line to form a cross */}
            <div className="absolute left-0 right-[-24px] top-0 h-[1px] bg-[#E3D5CA]/25" />
          </div>

          {/* Desktop Vertical Line extending above and below horizontal line to form a cross (Desktop only) */}
          <div className="hidden lg:block absolute left-0 top-[-24px] bottom-[-24px] w-[1px] bg-[#E3D5CA]/25 pointer-events-none select-none z-20" />

          <p className="font-cormorant italic text-[17px] sm:text-[22px] lg:text-[28px] leading-relaxed text-[#E3D5CA]/90 font-light mb-3 sm:mb-4">
            "{reviews[0].quote}"
          </p>
          <div className="w-12 h-px bg-[#E3D5CA]/30 my-4" />
          <h4 className="font-neuemontreal text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#E3D5CA]/80 font-bold">
            {reviews[0].author}
          </h4>
          <p className="font-neuemontreal text-[8px] sm:text-[10px] uppercase tracking-[0.15em] text-[#E3D5CA]/40 mt-1">
            {reviews[0].role}
          </p>
        </div>
      </div>

      {/* SLIDE 1: FULL SCREEN SHOWCASE OF TESTIMONY IMAGE 2 */}
      <div className="w-screen h-screen flex-shrink-0 flex items-center justify-center relative z-10 -ml-[8px]" style={{ backgroundColor: testimonyBgColor, transition: 'background-color 0.1s linear' }}>
        <img
          src={testimonySlide2Img}
          alt="Testimony Slide 2"
          className="absolute inset-0 w-full h-full object-contain scale-95 xs:scale-100 sm:scale-110 lg:scale-120 translate-y-6 sm:translate-y-10 lg:translate-y-15 z-0 select-none pointer-events-none"
        />
      </div>

      {/* REVIEW 2: Floating typography, aligned bottom-right */}
      <div className="w-screen lg:w-[40vw] h-screen flex-shrink-0 flex flex-col justify-center items-end pr-[8vw] pl-[6vw] lg:pl-0 relative z-10 -ml-[8px]" style={{ backgroundColor: testimonyBgColor, transition: 'background-color 0.1s linear' }}>
        {/* Desktop Architectural Pin */}
        <div className="absolute lg:bottom-[26.5vh] lg:top-auto top-1/2 lg:translate-y-0 -translate-y-1/2 right-[calc(3vw-24px)] flex flex-row-reverse items-center select-none pointer-events-none z-20 lg:hidden">
          <div className="relative flex items-center justify-center w-6 h-6">
            <div className="absolute w-full h-full rounded-full border border-[#E3D5CA]/20 animate-ping opacity-75 [animation-duration:3s]" />
            <div className="absolute w-4 h-4 rounded-full border border-[#E3D5CA]/35" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#E3D5CA] shadow-[0_0_8px_rgba(227,213,202,0.8)]" />
          </div>
          <div className="w-[5vw] h-[1px] bg-[#E3D5CA]/25" />
        </div>

        {/* Text block with right border */}
        <div className="border-r lg:border-r-0 border-[#E3D5CA]/20 pr-6 sm:pr-8 lg:pr-10 py-2 lg:py-0 lg:pt-8 lg:pb-12 text-right relative z-10 max-w-[85vw] lg:max-w-lg">
          {/* Desktop Architectural Pin & Lines (Desktop only) */}
          <div className="hidden lg:block absolute left-full top-0 w-[5vw] pointer-events-none select-none z-20">
            {/* Concentric Circle Pin */}
            <div className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6">
              <div className="absolute w-full h-full rounded-full border border-[#E3D5CA]/20 animate-ping opacity-75 [animation-duration:3s]" />
              <div className="absolute w-4 h-4 rounded-full border border-[#E3D5CA]/35" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#E3D5CA] shadow-[0_0_8px_rgba(227,213,202,0.8)]" />
            </div>
            {/* Horizontal Line extending past vertical line to form a cross */}
            <div className="absolute left-[-24px] right-0 top-0 h-[1px] bg-[#E3D5CA]/25" />
          </div>

          {/* Desktop Vertical Line extending above and below horizontal line to form a cross (Desktop only) */}
          <div className="hidden lg:block absolute right-0 top-[-24px] bottom-[-24px] w-[1px] bg-[#E3D5CA]/25 pointer-events-none select-none z-20" />

          <p className="font-cormorant italic text-[17px] sm:text-[22px] lg:text-[28px] leading-relaxed text-[#E3D5CA]/90 font-light mb-3 sm:mb-4">
            "{reviews[1].quote}"
          </p>
          <div className="w-12 h-px bg-[#E3D5CA]/30 my-4 ml-auto" />
          <h4 className="font-neuemontreal text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#E3D5CA]/80 font-bold">
            {reviews[1].author}
          </h4>
          <p className="font-neuemontreal text-[8px] sm:text-[10px] uppercase tracking-[0.15em] text-[#E3D5CA]/40 mt-1">
            {reviews[1].role}
          </p>
        </div>
      </div>

      {/* SLIDE 2: FULL SCREEN SHOWCASE OF TESTIMONY IMAGE 3 */}
      <div className="w-screen h-screen flex-shrink-0 flex items-center justify-center relative z-10 -ml-[8px]" style={{ backgroundColor: testimonyBgColor, transition: 'background-color 0.1s linear' }}>
        <img
          src={testimonySlide3Img}
          alt="Testimony Slide 3"
          className="absolute inset-0 w-full h-full object-contain scale-95 xs:scale-100 sm:scale-110 lg:scale-120 translate-y-2 sm:translate-y-4 lg:translate-y-6 z-0 select-none pointer-events-none"
        />
      </div>

      {/* REVIEW 3: Floating typography, aligned top-right */}
      <div className="w-screen lg:w-[40vw] h-screen flex-shrink-0 flex flex-col justify-center items-end pr-[8vw] pl-[6vw] lg:pl-0 relative z-10 -ml-[8px]" style={{ backgroundColor: testimonyBgColor, transition: 'background-color 0.1s linear' }}>
        {/* Desktop Architectural Pin */}
        <div className="absolute lg:top-[24.5vh] top-1/2 lg:translate-y-0 -translate-y-1/2 right-[calc(3vw-24px)] flex flex-row-reverse items-center select-none pointer-events-none z-20 lg:hidden">
          <div className="relative flex items-center justify-center w-6 h-6">
            <div className="absolute w-full h-full rounded-full border border-[#E3D5CA]/20 animate-ping opacity-75 [animation-duration:3s]" />
            <div className="absolute w-4 h-4 rounded-full border border-[#E3D5CA]/35" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#E3D5CA] shadow-[0_0_8px_rgba(227,213,202,0.8)]" />
          </div>
          <div className="w-[5vw] h-[1px] bg-[#E3D5CA]/25" />
        </div>

        {/* Text block with right border */}
        <div className="border-r lg:border-r-0 border-[#E3D5CA]/20 pr-6 sm:pr-8 lg:pr-10 py-2 lg:py-0 lg:pt-8 lg:pb-12 text-right relative z-10 max-w-[85vw] lg:max-w-lg">
          {/* Desktop Architectural Pin & Lines (Desktop only) */}
          <div className="hidden lg:block absolute left-full top-0 w-[5vw] pointer-events-none select-none z-20">
            {/* Concentric Circle Pin */}
            <div className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6">
              <div className="absolute w-full h-full rounded-full border border-[#E3D5CA]/20 animate-ping opacity-75 [animation-duration:3s]" />
              <div className="absolute w-4 h-4 rounded-full border border-[#E3D5CA]/35" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#E3D5CA] shadow-[0_0_8px_rgba(227,213,202,0.8)]" />
            </div>
            {/* Horizontal Line extending past vertical line to form a cross */}
            <div className="absolute left-[-24px] right-0 top-0 h-[1px] bg-[#E3D5CA]/25" />
          </div>

          {/* Desktop Vertical Line extending above and below horizontal line to form a cross (Desktop only) */}
          <div className="hidden lg:block absolute right-0 top-[-24px] bottom-[-24px] w-[1px] bg-[#E3D5CA]/25 pointer-events-none select-none z-20" />

          <p className="font-cormorant italic text-[17px] sm:text-[22px] lg:text-[28px] leading-relaxed text-[#E3D5CA]/90 font-light mb-3 sm:mb-4">
            "{reviews[2].quote}"
          </p>
          <div className="w-12 h-px bg-[#E3D5CA]/30 my-4 ml-auto" />
          <h4 className="font-neuemontreal text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#E3D5CA]/80 font-bold">
            {reviews[2].author}
          </h4>
          <p className="font-neuemontreal text-[8px] sm:text-[10px] uppercase tracking-[0.15em] text-[#E3D5CA]/40 mt-1">
            {reviews[2].role}
          </p>
        </div>
      </div>

      {/* SLIDE 3: FULL SCREEN SHOWCASE OF TESTIMONY IMAGE 4 */}
      <div className="w-screen h-screen flex-shrink-0 flex items-center justify-center relative z-10 -ml-[8px]" style={{ backgroundColor: testimonyBgColor, transition: 'background-color 0.1s linear' }}>
        <img
          src={testimonySlide4Img}
          alt="Testimony Slide 4"
          className="absolute inset-0 w-full h-full object-contain scale-95 xs:scale-100 sm:scale-110 lg:scale-120 translate-y-12 sm:translate-y-24 lg:translate-y-36 z-0 select-none pointer-events-none"
        />
      </div>

      {/* REVIEW 4: Floating typography, aligned bottom-left */}
      <div className="w-screen lg:w-[40vw] h-screen flex-shrink-0 flex flex-col justify-center items-start pl-[8vw] pr-[6vw] lg:pr-0 relative z-10 -ml-[8px]" style={{ backgroundColor: testimonyBgColor, transition: 'background-color 0.1s linear' }}>
        {/* Desktop Architectural Pin */}
        <div className="absolute lg:bottom-[22vh] lg:top-auto top-1/2 lg:translate-y-0 -translate-y-1/2 left-[calc(3vw-24px)] flex items-center select-none pointer-events-none z-20 lg:hidden">
          <div className="relative flex items-center justify-center w-6 h-6">
            <div className="absolute w-full h-full rounded-full border border-[#E3D5CA]/20 animate-ping opacity-75 [animation-duration:3s]" />
            <div className="absolute w-4 h-4 rounded-full border border-[#E3D5CA]/35" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#E3D5CA] shadow-[0_0_8px_rgba(227,213,202,0.8)]" />
          </div>
          <div className="w-[5vw] h-[1px] bg-[#E3D5CA]/25" />
        </div>

        {/* Text block with left border */}
        <div className="border-l lg:border-l-0 border-[#E3D5CA]/20 pl-6 sm:pl-8 lg:pl-10 py-2 lg:py-0 lg:pt-8 lg:pb-12 relative z-10 max-w-[85vw] lg:max-w-lg">
          {/* Desktop Architectural Pin & Lines (Desktop only) */}
          <div className="hidden lg:block absolute right-full top-0 w-[5vw] pointer-events-none select-none z-20">
            {/* Concentric Circle Pin */}
            <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6">
              <div className="absolute w-full h-full rounded-full border border-[#E3D5CA]/20 animate-ping opacity-75 [animation-duration:3s]" />
              <div className="absolute w-4 h-4 rounded-full border border-[#E3D5CA]/35" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#E3D5CA] shadow-[0_0_8px_rgba(227,213,202,0.8)]" />
            </div>
            {/* Horizontal Line extending past vertical line to form a cross */}
            <div className="absolute left-0 right-[-24px] top-0 h-[1px] bg-[#E3D5CA]/25" />
          </div>

          {/* Desktop Vertical Line extending above and below horizontal line to form a cross (Desktop only) */}
          <div className="hidden lg:block absolute left-0 top-[-24px] bottom-[-24px] w-[1px] bg-[#E3D5CA]/25 pointer-events-none select-none z-20" />

          <p className="font-cormorant italic text-[17px] sm:text-[22px] lg:text-[28px] leading-relaxed text-[#E3D5CA]/90 font-light mb-3 sm:mb-4">
            "{reviews[3].quote}"
          </p>
          <div className="w-12 h-px bg-[#E3D5CA]/30 my-4" />
          <h4 className="font-neuemontreal text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#E3D5CA]/80 font-bold">
            {reviews[3].author}
          </h4>
          <p className="font-neuemontreal text-[8px] sm:text-[10px] uppercase tracking-[0.15em] text-[#E3D5CA]/40 mt-1">
            {reviews[3].role}
          </p>
        </div>
      </div>

      {/* SLIDE 4: FULL SCREEN SHOWCASE OF TESTIMONY IMAGE 5 */}
      <div className="testimony-slide-last w-screen h-screen flex-shrink-0 flex items-center justify-center relative z-10 -ml-[8px]" style={{ backgroundColor: testimonyBgColor, transition: 'background-color 0.1s linear' }}>
        <img
          src={testimonySlide5Img}
          alt="Testimony Slide 5"
          className="absolute inset-0 w-full h-full object-contain scale-80 xs:scale-85 sm:scale-90 translate-y-6 sm:translate-y-10 lg:translate-y-15 z-0 select-none pointer-events-none"
        />
      </div>

      {/* REVIEW 5: Floating typography, aligned center but styled like other left-aligned slides */}
      <div className="w-screen lg:w-[40vw] h-screen flex-shrink-0 flex flex-col justify-center items-start pl-[8vw] pr-[6vw] lg:pr-0 relative z-10 -ml-[8px]" style={{ backgroundColor: testimonyBgColor, transition: 'background-color 0.1s linear' }}>
        <div className="flex flex-col items-start text-left max-w-lg lg:-translate-x-[8vw] relative border-l lg:border-l-0 border-[#E3D5CA]/20 pl-6 sm:pl-8 lg:pl-10 py-2 lg:py-0 lg:pt-8 lg:pb-12">
          {/* Desktop Architectural Pin */}
          <div className="absolute lg:top-[4.5vh] top-1/2 lg:translate-y-0 -translate-y-1/2 -left-[calc(5vw+24px)] flex items-center select-none pointer-events-none z-20 lg:hidden">
            <div className="relative flex items-center justify-center w-6 h-6">
              <div className="absolute w-full h-full rounded-full border border-[#E3D5CA]/20 animate-ping opacity-75 [animation-duration:3s]" />
              <div className="absolute w-4 h-4 rounded-full border border-[#E3D5CA]/35" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#E3D5CA] shadow-[0_0_8px_rgba(227,213,202,0.8)]" />
            </div>
            {/* Meets the border-l exactly */}
            <div className="w-[5vw] h-[1px] bg-[#E3D5CA]/25" />
          </div>

          {/* Desktop Architectural Pin & Lines (Desktop only) */}
          <div className="hidden lg:block absolute right-full top-0 w-[5vw] pointer-events-none select-none z-20">
            {/* Concentric Circle Pin */}
            <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6">
              <div className="absolute w-full h-full rounded-full border border-[#E3D5CA]/20 animate-ping opacity-75 [animation-duration:3s]" />
              <div className="absolute w-4 h-4 rounded-full border border-[#E3D5CA]/35" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#E3D5CA] shadow-[0_0_8px_rgba(227,213,202,0.8)]" />
            </div>
            {/* Horizontal Line extending past vertical line to form a cross */}
            <div className="absolute left-0 right-[-24px] top-0 h-[1px] bg-[#E3D5CA]/25" />
          </div>

          {/* Desktop Vertical Line extending above and below horizontal line to form a cross (Desktop only) */}
          <div className="hidden lg:block absolute left-0 top-[-24px] bottom-[-24px] w-[1px] bg-[#E3D5CA]/25 pointer-events-none select-none z-20" />

          <p className="font-cormorant italic text-[17px] sm:text-[22px] lg:text-[28px] leading-relaxed text-[#E3D5CA]/90 font-light mb-3 sm:mb-4">
            "{reviews[4].quote}"
          </p>
          <div className="w-12 h-px bg-[#E3D5CA]/30 my-4" />
          <h4 className="font-neuemontreal text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#E3D5CA]/80 font-bold">
            {reviews[4].author}
          </h4>
          <p className="font-neuemontreal text-[8px] sm:text-[10px] uppercase tracking-[0.15em] text-[#E3D5CA]/40 mt-1">
            {reviews[4].role}
          </p>
        </div>
      </div>
    </div>
  )
})

TestimonyTrack.displayName = 'TestimonyTrack'
export default TestimonyTrack
