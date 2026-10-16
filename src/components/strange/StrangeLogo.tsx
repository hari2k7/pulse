import type { FC } from 'react';
import { Link } from 'react-router-dom';

export interface StrangeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  asLink?: boolean;
  withTagline?: boolean;
  className?: string;
}

/**
 * STRANGE Logo (Sigil + Wordmark)
 * Original mystical geometric sigil with Cinzel serif typography.
 * No Marvel logos or copyrighted marks.
 */
export const StrangeLogo: FC<StrangeLogoProps> = ({
  size = 'md',
  asLink = true,
  withTagline = false,
  className = '',
}) => {
  const sizeMap = {
    sm: {
      text: 'text-lg tracking-[0.2em]',
      sigil: 22,
      tag: 'text-[9px] tracking-widest',
    },
    md: {
      text: 'text-2xl tracking-[0.25em]',
      sigil: 28,
      tag: 'text-[10px] tracking-widest',
    },
    lg: {
      text: 'text-3xl sm:text-4xl tracking-[0.25em]',
      sigil: 36,
      tag: 'text-xs tracking-widest',
    },
    xl: {
      text: 'text-4xl sm:text-5xl md:text-6xl tracking-[0.3em]',
      sigil: 52,
      tag: 'text-sm tracking-widest',
    },
  }[size];

  const content = (
    <span
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      aria-label="STRANGE — A Tech Fest Beyond Reality"
    >
      {/* Circular Mystical Sigil */}
      <span className="relative flex items-center justify-center shrink-0" aria-hidden="true">
        <svg
          width={sizeMap.sigil}
          height={sizeMap.sigil}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-500 group-hover:rotate-45"
        >
          {/* Outer runic border */}
          <circle cx="24" cy="24" r="22" stroke="#FF7A1A" strokeWidth="1.5" strokeOpacity="0.8" />
          <circle cx="24" cy="24" r="18" stroke="#F5B642" strokeWidth="1" strokeDasharray="3 2" />
          {/* Interlocking geometric square and diamond */}
          <rect x="13" y="13" width="22" height="22" stroke="#FF7A1A" strokeWidth="1.2" strokeOpacity="0.7" />
          <rect
            x="13"
            y="13"
            width="22"
            height="22"
            transform="rotate(45 24 24)"
            stroke="#F5B642"
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />
          {/* Center portal aperture */}
          <circle cx="24" cy="24" r="6" fill="#0D1020" stroke="#FF7A1A" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="2" fill="#F5B642" />
        </svg>
        <span
          className="absolute inset-0 rounded-full blur-[6px] bg-gradient-to-r from-[#FF7A1A]/30 to-[#F5B642]/30 pointer-events-none"
          aria-hidden="true"
        />
      </span>

      {/* Typography */}
      <span className="flex flex-col">
        <span className={`font-display font-bold uppercase text-[#F3EFE8] leading-none ${sizeMap.text}`}>
          STR<span className="text-[#FF7A1A]">A</span>NGE
        </span>
        {withTagline && (
          <span className={`font-body uppercase text-[#B8B3C7] mt-1 ${sizeMap.tag}`}>
            A Tech Fest Beyond Reality
          </span>
        )}
      </span>
    </span>
  );

  if (asLink) {
    return (
      <Link
        to="/"
        className="group inline-flex items-center transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[#FF7A1A] rounded-md"
        aria-label="STRANGE Home"
      >
        {content}
      </Link>
    );
  }

  return content;
};
