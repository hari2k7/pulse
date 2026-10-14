import type { FC } from 'react';

export interface SpellCircleRingsProps {
  size?: number | string;
  className?: string;
  color?: 'orange' | 'blue' | 'green' | 'violet';
  opacity?: number;
}

/**
 * Concentric Mystic Spell Circle Rings
 * Original geometric runes, dashed orbits, and interlocking energy shields.
 * Pure SVG + CSS animations (transform only).
 */
export const SpellCircleRings: FC<SpellCircleRingsProps> = ({
  size = 400,
  className = '',
  color = 'orange',
  opacity = 0.85,
}) => {
  const colorMap = {
    orange: {
      primary: '#FF7A1A',
      secondary: '#F5B642',
      glow: 'rgba(255, 122, 26, 0.35)',
    },
    blue: {
      primary: '#3BA3FF',
      secondary: '#90CAF9',
      glow: 'rgba(59, 163, 255, 0.35)',
    },
    green: {
      primary: '#3DDC97',
      secondary: '#A7F3D0',
      glow: 'rgba(61, 220, 151, 0.35)',
    },
    violet: {
      primary: '#A66BFF',
      secondary: '#DDD6FE',
      glow: 'rgba(166, 107, 255, 0.35)',
    },
  }[color];

  return (
    <div
      className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size, opacity }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <radialGradient id={`spell-glow-${color}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colorMap.secondary} stopOpacity="0.25" />
            <stop offset="70%" stopColor={colorMap.primary} stopOpacity="0.08" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient background energy field */}
        <circle cx="250" cy="250" r="240" fill={`url(#spell-glow-${color})`} />

        {/* Outer Ring: Rotating Clockwise */}
        <g className="animate-spell-spin" style={{ transformOrigin: 'center' }}>
          <circle cx="250" cy="250" r="230" stroke={colorMap.primary} strokeWidth="2" strokeOpacity="0.6" />
          <circle
            cx="250"
            cy="250"
            r="220"
            stroke={colorMap.secondary}
            strokeWidth="1.2"
            strokeDasharray="4 8 12 8"
            strokeOpacity="0.7"
          />
          {/* Outer glyph ticks */}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i * 360) / 16;
            return (
              <line
                key={i}
                x1="250"
                y1="25"
                x2="250"
                y2="33"
                stroke={colorMap.primary}
                strokeWidth="2"
                transform={`rotate(${angle} 250 250)`}
              />
            );
          })}
        </g>

        {/* Middle Interlocking Geometry: Rotating Counter-Clockwise */}
        <g className="animate-spell-spin-reverse" style={{ transformOrigin: 'center' }}>
          <circle cx="250" cy="250" r="170" stroke={colorMap.secondary} strokeWidth="1.5" strokeOpacity="0.5" />
          <polygon
            points="250,90 380,320 120,320"
            stroke={colorMap.primary}
            strokeWidth="1.2"
            strokeOpacity="0.65"
          />
          <polygon
            points="250,410 380,180 120,180"
            stroke={colorMap.primary}
            strokeWidth="1.2"
            strokeOpacity="0.65"
          />
          <circle
            cx="250"
            cy="250"
            r="140"
            stroke={colorMap.secondary}
            strokeWidth="1"
            strokeDasharray="8 6"
            strokeOpacity="0.8"
          />
        </g>

        {/* Inner Ring: Concentric Pulsing Core */}
        <g className="animate-portal-pulse" style={{ transformOrigin: 'center' }}>
          <circle cx="250" cy="250" r="100" stroke={colorMap.primary} strokeWidth="2" strokeOpacity="0.8" />
          <circle cx="250" cy="250" r="92" stroke={colorMap.secondary} strokeWidth="1" strokeDasharray="2 4" />
          <circle cx="250" cy="250" r="70" stroke={colorMap.primary} strokeWidth="1.5" strokeOpacity="0.6" />
          <circle cx="250" cy="250" r="40" fill={colorMap.primary} fillOpacity="0.12" />
        </g>
      </svg>
    </div>
  );
};
