// src/components/icons/code-pi-logo.tsx
import type { SVGProps } from 'react';

export function CodePiLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 130 30" // Defines the coordinate system for the SVG
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props} // Spread props to allow className, style, width, height etc.
    >
      {/* Red background for CODE part */}
      <rect width="88" height="30" rx="3" fill="#F26262" />

      {/* C */}
      <text
        x="8"
        y="21.5"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="18"
        fontWeight="bold"
        fill="white"
      >
        C
      </text>

      {/* Stylized O - outer circle */}
      <circle cx="34" cy="15" r="8" stroke="white" strokeWidth="1.5" fill="#F26262" />

      {/* 'Home/Pi' like symbol inside O */}
      {/* Arch part */}
      <path d="M30 14 Q34 10.5 38 14" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Legs */}
      <path d="M31.0 13.5 L31.0 18.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M37.0 13.5 L37.0 18.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

      {/* D */}
      <text
        x="48"
        y="21.5"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="18"
        fontWeight="bold"
        fill="white"
      >
        D
      </text>
      
      {/* E */}
      <text
        x="63" 
        y="21.5"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="18"
        fontWeight="bold"
        fill="white"
      >
        E
      </text>

      {/* Pi text part (outside the red box) */}
      <text
        x="94"
        y="21.5"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="18"
        fontWeight="bold"
        fill="#F26262" 
      >
        Pi
      </text>
    </svg>
  );
}
