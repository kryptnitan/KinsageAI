import React from 'react'

export default function KinsageLogo({ 
  className = 'w-10 h-10', 
  showText = false, 
  textClassName = 'text-2xl font-bold tracking-wider' 
}: { 
  className?: string 
  showText?: boolean 
  textClassName?: string 
}) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center">
        {/* Subtle gold glow behind the logo */}
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-md animate-pulse"></div>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${className} relative z-10 text-primary`}
        >
          {/* Central dot - core of family wisdom */}
          <circle cx="100" cy="100" r="14" fill="currentColor" />
          
          {/* Interlocking generations loops with mathematical 4-fold rotational symmetry */}
          <g stroke="currentColor" strokeWidth="15" strokeLinecap="round" fill="none">
            {/* Loop 1: Top-Left */}
            <path d="M 122 72 A 34 34 0 1 0 72 122" />
            
            {/* Loop 2: Bottom-Left (Rotated 90 degrees) */}
            <path d="M 122 72 A 34 34 0 1 0 72 122" transform="rotate(90 100 100)" />
            
            {/* Loop 3: Bottom-Right (Rotated 180 degrees) */}
            <path d="M 122 72 A 34 34 0 1 0 72 122" transform="rotate(180 100 100)" />
            
            {/* Loop 4: Top-Right (Rotated 270 degrees) */}
            <path d="M 122 72 A 34 34 0 1 0 72 122" transform="rotate(270 100 100)" />
          </g>
        </svg>
      </div>
      {showText && (
        <span className={`font-display text-[#f8fafc] ${textClassName}`}>
          Kinsage<span className="text-primary font-sans font-extrabold">.</span>
        </span>
      )}
    </div>
  )
}
