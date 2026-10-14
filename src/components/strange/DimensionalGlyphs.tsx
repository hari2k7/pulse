import type { FC, SVGProps } from 'react';

export type GlyphType = 'overview' | 'schedule' | 'prizes' | 'rules' | 'faqs' | 'contacts';

export interface GlyphProps extends SVGProps<SVGSVGElement> {
  type: GlyphType;
  size?: number;
  className?: string;
}

/**
 * STRANGE Dimensional Glyphs
 * Original vector runes for section navigation:
 * - overview: Codex Aperture / All-Seeing Eye
 * - schedule: Chrono Astrolabe / Solar Hourglass
 * - prizes: Ascendant Relic / Crown
 * - rules: Sacred Geometer's Scroll
 * - faqs: Oracle Rune
 * - contacts: Astral Beacon
 */
export const Glyph: FC<GlyphProps> = ({ type, size = 20, className = '', ...props }) => {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
    ...props,
  };

  switch (type) {
    case 'overview':
      // Codex Eye / Aperture
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" strokeOpacity="0.4" strokeDasharray="2 2" />
          <path d="M2.5 12c2.5-4.5 6-7 9.5-7s7 2.5 9.5 7c-2.5 4.5-6 7-9.5 7s-7-2.5-9.5-7z" />
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
      );

    case 'schedule':
      // Chrono Astrolabe / Hourglass
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
          <path d="M7 4h10M7 20h10" />
          <path d="M7 4l5 8-5 8M17 4l-5 8 5 8" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );

    case 'prizes':
      // Ascendant Relic / Crown
      return (
        <svg {...commonProps}>
          <path d="M4 18h16l1.5-11-5 4-4.5-7-4.5 7-5-4L4 18z" />
          <circle cx="12" cy="18" r="2" fill="currentColor" />
          <circle cx="6" cy="18" r="1" fill="currentColor" />
          <circle cx="18" cy="18" r="1" fill="currentColor" />
          <circle cx="12" cy="4" r="1" />
        </svg>
      );

    case 'rules':
      // Sacred Geometer's Scroll / Mandala Law
      return (
        <svg {...commonProps}>
          <rect x="4" y="4" width="16" height="16" rx="2" strokeOpacity="0.5" />
          <path d="M9 8h6M9 12h6M9 16h4" />
          <path d="M16 16l3 3" />
          <circle cx="6" cy="8" r="1" fill="currentColor" />
          <circle cx="6" cy="12" r="1" fill="currentColor" />
          <circle cx="6" cy="16" r="1" fill="currentColor" />
        </svg>
      );

    case 'faqs':
      // Oracle Rune / Question Sigil
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 014.5 1.5c0 1.5-2 2-2 3.5" />
          <circle cx="12" cy="17" r="1" fill="currentColor" />
        </svg>
      );

    case 'contacts':
      // Astral Beacon / Communicator
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M6.3 6.3a8 8 0 000 11.4M17.7 6.3a8 8 0 010 11.4" />
          <path d="M3.5 3.5a12 12 0 000 17M20.5 3.5a12 12 0 010 17" />
        </svg>
      );

    default:
      return null;
  }
};
