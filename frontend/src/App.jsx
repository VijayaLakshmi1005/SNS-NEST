import React, { useState } from 'react'
import dayHeroImg from '../Assets/Dayhero.png'
import nightHeroImg from '../Assets/Nighthero.png'

function App() {
  const [isNight, setIsNight] = useState(false)

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none flex flex-col justify-end items-center pb-12">
      {/* Day Hero Image (Fades out when night mode is active) */}
      <img 
        src={dayHeroImg} 
        alt="SNS Nest Day Banner" 
        className={`absolute inset-0 w-full h-full object-fill transition-opacity duration-1000 ease-in-out ${
          isNight ? 'opacity-0' : 'opacity-100'
        }`} 
      />

      {/* Night Hero Image (Fades in when night mode is active) */}
      <img 
        src={nightHeroImg} 
        alt="SNS Nest Night Banner" 
        className={`absolute inset-0 w-full h-full object-fill transition-opacity duration-1000 ease-in-out ${
          isNight ? 'opacity-100' : 'opacity-0'
        }`} 
      />

      {/* Unique & Highly Aesthetic Mode Selector (Utilizing the customized Linen/Warm-Gray Color Palette) */}
      <div className="relative z-20 flex items-center bg-[#817773]/40 backdrop-blur-md p-1 rounded-full border border-[#D5BDAF]/20 shadow-2xl select-none">
        {/* Smooth Sliding Pill Backdrop (Linen tone #F5EBE0) */}
        <div 
          className={`absolute top-1 bottom-1 left-1 w-20 rounded-full bg-[#F5EBE0] shadow-md transition-transform duration-300 ease-in-out z-10 ${
            isNight ? 'translate-x-20' : 'translate-x-0'
          }`}
        />
        
        {/* Day Button */}
        <button
          onClick={() => setIsNight(false)}
          className={`w-20 h-7 flex items-center justify-center text-[10px] font-bold tracking-widest transition-colors duration-300 cursor-pointer uppercase outline-none relative z-20 ${
            !isNight ? 'text-[#1C1512]' : 'text-[#F5EBE0]/60 hover:text-[#F5EBE0]'
          }`}
        >
          Day
        </button>
        
        {/* Night Button */}
        <button
          onClick={() => setIsNight(true)}
          className={`w-20 h-7 flex items-center justify-center text-[10px] font-bold tracking-widest transition-colors duration-300 cursor-pointer uppercase outline-none relative z-20 ${
            isNight ? 'text-[#1C1512]' : 'text-[#F5EBE0]/60 hover:text-[#F5EBE0]'
          }`}
        >
          Night
        </button>
      </div>
    </div>
  )
}

export default App










