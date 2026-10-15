import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { FESTIVAL_CONFIG } from '../../config/festival';

/**
 * Scene 6: Sanctum About Narrative
 * - Quieter Sanctum interior (sigil / arched-window vector art)
 * - Heading: "NOT EVERY REALITY IS DISCOVERED. SOME ARE CREATED."
 * - Short honest copy: organizers, college, experiences strictly from festival.ts (hide missing parts)
 * - Original artwork, no stock photos
 */
export const SanctumAbout: FC = () => {
  return (
    <section
      id="about"
      className="scroll-mt-24 relative w-full py-16 sm:py-20 md:py-24 bg-[#07060D] border-t border-[#FF7A1A]/20 overflow-hidden"
      aria-labelledby="about-heading"
    >
      {/* Atmospheric Film Grain Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-film-grain opacity-50 z-10" aria-hidden="true" />

      {/* Background Layer: Quieter Sanctum Arched-Window & Sigil Artwork */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] opacity-15 pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 600 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-contain"
        >
          {/* Outer Cathedral Arch Silhouettes */}
          <path
            d="M100 500 V220 C100 110 200 40 300 40 C400 40 500 110 500 220 V500"
            stroke="#F5B642"
            strokeWidth="2"
            strokeOpacity="0.4"
          />
          <path
            d="M140 500 V230 C140 135 220 75 300 75 C380 75 460 135 460 230 V500"
            stroke="#FF7A1A"
            strokeWidth="1.2"
            strokeOpacity="0.3"
          />

          {/* Center Rosette Sigil */}
          <circle cx="300" cy="180" r="65" stroke="#F5B642" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="6 4" />
          <circle cx="300" cy="180" r="45" stroke="#3DDC97" strokeWidth="1.2" strokeOpacity="0.4" />
          <polygon
            points="300,120 350,210 250,210"
            stroke="#F5B642"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          <polygon
            points="300,240 350,150 250,150"
            stroke="#F5B642"
            strokeWidth="1"
            strokeOpacity="0.4"
          />

          {/* Transom horizontal lintel */}
          <line x1="100" y1="260" x2="500" y2="260" stroke="#F5B642" strokeWidth="2" strokeOpacity="0.3" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-8">
        {/* Heading */}
        <h2
          id="about-heading"
          tabIndex={-1}
          className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-[#F3EFE8] leading-tight tracking-wider outline-none"
        >
          NOT EVERY REALITY IS DISCOVERED.
          <br />
          <span className="text-[#FF7A1A]">SOME ARE CREATED.</span>
        </h2>

        {/* Honest Copy */}
        <div className="max-w-2xl space-y-4 text-sm sm:text-base md:text-lg text-[#B8B3C7] leading-relaxed">
          <p>
            STRANGE is a gathering of builders, hackers, and creators navigating multi-dimensional
            crucibles of software, autonomous robotics, algorithms, and interdisciplinary arts.
          </p>
          {(FESTIVAL_CONFIG.collegeName || FESTIVAL_CONFIG.venue) && (
            <p>
              Convened {FESTIVAL_CONFIG.collegeName ? `under the auspices of ${FESTIVAL_CONFIG.collegeName}` : ''}{' '}
              {FESTIVAL_CONFIG.venue ? `at ${FESTIVAL_CONFIG.venue}` : ''}.
            </p>
          )}
          {FESTIVAL_CONFIG.organizers && FESTIVAL_CONFIG.organizers.length > 0 && (
            <p className="text-xs uppercase tracking-widest text-[#F5B642] pt-2 font-mono">
              Organized by {FESTIVAL_CONFIG.organizers.join(' • ')}
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            to="/events"
            className="inline-flex items-center justify-center font-bold text-xs sm:text-sm uppercase tracking-wider px-6 sm:px-8 py-3 rounded-md bg-[#0D1020] border border-[#FF7A1A]/60 text-[#F3EFE8] hover:border-[#F5B642] hover:text-[#F5B642] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]"
          >
            Explore the Multiverse
          </Link>
        </div>
      </div>
    </section>
  );
};
