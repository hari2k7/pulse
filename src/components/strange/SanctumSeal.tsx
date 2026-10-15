import type { FC } from 'react';

export interface SanctumSealProps {
  size?: number | string;
  className?: string;
  glow?: boolean;
}

/**
 * Sanctum Sanctorum Mystical Window Seal
 * Original vector design with 4 curved mystical lines, runic perimeter, and slow rotation.
 */
export const SanctumSeal: FC<SanctumSealProps> = ({
  size = 320,
  className = '',
  glow = true,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Outer ambient glow without heavy multi-pass blur */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,122,26,0.12)_0%,rgba(245,182,66,0.08)_50%,transparent_70%)] pointer-events-none"
          aria-hidden="true"
        />
      )}

      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full animate-spell-spin"
        style={{ animationDuration: '90s' }}
      >
        <defs>
          <linearGradient id="sanctum-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5B642" />
            <stop offset="50%" stopColor="#FF7A1A" />
            <stop offset="100%" stopColor="#C8102E" />
          </linearGradient>
        </defs>

        {/* Outer concentric rings */}
        <circle cx="200" cy="200" r="190" stroke="url(#sanctum-gold)" strokeWidth="2.5" strokeOpacity="0.75" />
        <circle cx="200" cy="200" r="180" stroke="#F5B642" strokeWidth="1" strokeDasharray="6 4" strokeOpacity="0.6" />
        <circle cx="200" cy="200" r="172" stroke="#FF7A1A" strokeWidth="1.5" strokeOpacity="0.5" />

        {/* Radial perimeter markers (12 astrological/dimensional houses) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 360) / 12;
          return (
            <g key={i} transform={`rotate(${angle} 200 200)`}>
              <line x1="200" y1="20" x2="200" y2="28" stroke="#F5B642" strokeWidth="2" strokeOpacity="0.8" />
              <circle cx="200" cy="34" r="1.5" fill="#FF7A1A" />
            </g>
          );
        })}

        {/* The 4-Fold Intertwined Sanctum Curved Lines */}
        <path
          d="M 200 30 C 270 120 270 280 200 370"
          stroke="url(#sanctum-gold)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
        <path
          d="M 200 30 C 130 120 130 280 200 370"
          stroke="url(#sanctum-gold)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
        <path
          d="M 30 200 C 120 270 280 270 370 200"
          stroke="url(#sanctum-gold)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
        <path
          d="M 30 200 C 120 130 280 130 370 200"
          stroke="url(#sanctum-gold)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />

        {/* Center occult aperture */}
        <circle cx="200" cy="200" r="42" fill="#07060D" stroke="#FF7A1A" strokeWidth="2" />
        <circle cx="200" cy="200" r="32" stroke="#F5B642" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="200" cy="200" r="14" fill="#FF7A1A" fillOpacity="0.25" stroke="#F5B642" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="4" fill="#F3EFE8" />
      </svg>
    </div>
  );
};
