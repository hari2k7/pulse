import type { FC } from 'react';

export interface SanctumChamberWorldProps {
  className?: string;
  isReceding?: boolean;
}

/**
 * Sanctum Chamber World Artwork (Scene 1 & 2 Portal Interior)
 * Original layered SVG scene:
 * - Twilight-blue atmospheric haze & deep cosmos outside the grand window
 * - Huge gothic arched window with fine brass tracery & amber radiance
 * - Dark fluted stone columns with ornate capitals flanking the chamber
 * - Concentric brass floor rings & mystical stone floor tiles
 * - Ambient warm amber light & twilight contrast
 * Pure vector SVG, zero external assets, under 4KB, instantaneous first paint.
 */
export const SanctumChamberWorld: FC<SanctumChamberWorldProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none pointer-events-none rounded-full ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Sky Gradient: Twilight blue into deep mystic navy */}
          <radialGradient id="sanctum-sky" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1E2856" />
            <stop offset="40%" stopColor="#0F142E" />
            <stop offset="80%" stopColor="#070A18" />
            <stop offset="100%" stopColor="#04050D" />
          </radialGradient>

          {/* Window Amber Beam */}
          <radialGradient id="sanctum-amber-beam" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#FFE082" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#F5B642" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#FF7A1A" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FF7A1A" stopOpacity="0" />
          </radialGradient>

          {/* Stone Column Gradient */}
          <linearGradient id="sanctum-stone-left" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06070E" />
            <stop offset="50%" stopColor="#181B28" />
            <stop offset="90%" stopColor="#24283B" />
            <stop offset="100%" stopColor="#10121C" />
          </linearGradient>

          <linearGradient id="sanctum-stone-right" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#06070E" />
            <stop offset="50%" stopColor="#181B28" />
            <stop offset="90%" stopColor="#24283B" />
            <stop offset="100%" stopColor="#10121C" />
          </linearGradient>

          {/* Floor Gradient */}
          <linearGradient id="sanctum-floor" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#151724" />
            <stop offset="50%" stopColor="#0C0E17" />
            <stop offset="100%" stopColor="#05060A" />
          </linearGradient>
        </defs>

        {/* 1. Backdrop: Twilight-Blue Chamber Void */}
        <rect width="500" height="500" fill="url(#sanctum-sky)" />

        {/* Ambient Warm Light Core */}
        <ellipse cx="250" cy="230" rx="190" ry="170" fill="url(#sanctum-amber-beam)" />

        {/* Distant Star Constellations visible beyond the arches */}
        <g opacity="0.6">
          <circle cx="210" cy="140" r="1.5" fill="#FFE5A3" />
          <circle cx="290" cy="130" r="1.2" fill="#FFE5A3" />
          <circle cx="240" cy="110" r="1.8" fill="#FFFFFF" />
          <circle cx="265" cy="165" r="1.2" fill="#3BA3FF" />
          <circle cx="170" cy="190" r="1" fill="#FFE5A3" />
          <circle cx="330" cy="180" r="1.4" fill="#FFE5A3" />
        </g>

        {/* 2. Grand Sanctum Arched Window Tracery */}
        <g stroke="#F5B642" strokeOpacity="0.75" strokeWidth="2">
          {/* Main Outer Cathedral Arch */}
          <path d="M160 320 V200 C160 135 210 90 250 90 C290 90 340 135 340 200 V320" />
          {/* Inner Secondary Arch */}
          <path d="M175 320 V205 C175 150 215 105 250 105 C285 105 325 150 325 205 V320" strokeWidth="1.2" />

          {/* Twin Sub-Arches */}
          <path d="M175 320 V225 C175 185 210 160 212 160 C214 160 248 185 248 225 V320" strokeWidth="1.2" strokeOpacity="0.6" />
          <path d="M252 320 V225 C252 185 286 160 288 160 C290 160 325 185 325 225 V320" strokeWidth="1.2" strokeOpacity="0.6" />

          {/* Top Rosette Oculi */}
          <circle cx="250" cy="140" r="22" stroke="#FF7A1A" strokeWidth="1.5" strokeOpacity="0.8" />
          <circle cx="250" cy="140" r="12" stroke="#F5B642" strokeWidth="1" strokeOpacity="0.7" />
          <line x1="250" y1="118" x2="250" y2="162" strokeWidth="1" strokeOpacity="0.5" />
          <line x1="228" y1="140" x2="272" y2="140" strokeWidth="1" strokeOpacity="0.5" />

          {/* Horizontal Transom Lintel */}
          <line x1="160" y1="210" x2="340" y2="210" strokeWidth="2.5" stroke="#F5B642" />
        </g>

        {/* 3. Concentric Mystical Brass Floor Patterns */}
        <g>
          {/* Floor base polygon with perspective */}
          <polygon points="40,500 130,310 370,310 460,500" fill="url(#sanctum-floor)" />

          {/* Perspective grid lines */}
          <line x1="130" y1="310" x2="40" y2="500" stroke="#F5B642" strokeWidth="1.5" strokeOpacity="0.35" />
          <line x1="190" y1="310" x2="160" y2="500" stroke="#F5B642" strokeWidth="1" strokeOpacity="0.25" />
          <line x1="250" y1="310" x2="250" y2="500" stroke="#FF7A1A" strokeWidth="1.5" strokeOpacity="0.4" />
          <line x1="310" y1="310" x2="340" y2="500" stroke="#F5B642" strokeWidth="1" strokeOpacity="0.25" />
          <line x1="370" y1="310" x2="460" y2="500" stroke="#F5B642" strokeWidth="1.5" strokeOpacity="0.35" />

          {/* Concentric rings on floor in perspective */}
          <ellipse cx="250" cy="390" rx="140" ry="32" stroke="#F5B642" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
          <ellipse cx="250" cy="420" rx="180" ry="42" stroke="#FF7A1A" strokeWidth="1.8" strokeOpacity="0.35" strokeDasharray="8 6" fill="none" />
          <ellipse cx="250" cy="355" rx="90" ry="20" stroke="#F5B642" strokeWidth="1.2" strokeOpacity="0.45" fill="none" />
        </g>

        {/* 4. Massive Dark Fluted Stone Columns Flanking the Scene */}
        {/* Left Stone Column */}
        <g>
          <path d="M10 500 L85 500 L85 100 L10 100 Z" fill="url(#sanctum-stone-left)" />
          {/* Column Capital / Cornice */}
          <polygon points="0,110 95,110 85,130 10,130" fill="#1C1F2D" stroke="#F5B642" strokeWidth="1" strokeOpacity="0.4" />
          <polygon points="0,110 95,110 90,95 5,95" fill="#141724" stroke="#F5B642" strokeWidth="1" strokeOpacity="0.3" />
          {/* Vertical Fluting Lines */}
          <line x1="25" y1="130" x2="25" y2="500" stroke="#040509" strokeWidth="3" />
          <line x1="45" y1="130" x2="45" y2="500" stroke="#040509" strokeWidth="3" />
          <line x1="65" y1="130" x2="65" y2="500" stroke="#040509" strokeWidth="3" />
          <line x1="85" y1="100" x2="85" y2="500" stroke="#F5B642" strokeWidth="1.5" strokeOpacity="0.3" />
        </g>

        {/* Right Stone Column */}
        <g>
          <path d="M490 500 L415 500 L415 100 L490 100 Z" fill="url(#sanctum-stone-right)" />
          {/* Column Capital / Cornice */}
          <polygon points="405,110 500,110 490,130 415,130" fill="#1C1F2D" stroke="#F5B642" strokeWidth="1" strokeOpacity="0.4" />
          <polygon points="405,110 500,110 495,95 410,95" fill="#141724" stroke="#F5B642" strokeWidth="1" strokeOpacity="0.3" />
          {/* Vertical Fluting Lines */}
          <line x1="475" y1="130" x2="475" y2="500" stroke="#040509" strokeWidth="3" />
          <line x1="455" y1="130" x2="455" y2="500" stroke="#040509" strokeWidth="3" />
          <line x1="435" y1="130" x2="435" y2="500" stroke="#040509" strokeWidth="3" />
          <line x1="415" y1="100" x2="415" y2="500" stroke="#F5B642" strokeWidth="1.5" strokeOpacity="0.3" />
        </g>

        {/* Top Arch Vault Silhouette */}
        <path
          d="M0 0 L500 0 L500 70 C400 30 300 20 250 20 C200 20 100 30 0 70 Z"
          fill="#06070D"
        />

        {/* Subtle Atmospheric Vignette overlay around inner rim */}
        <circle cx="250" cy="250" r="248" stroke="#FF7A1A" strokeWidth="4" strokeOpacity="0.4" fill="none" />
      </svg>
    </div>
  );
};
