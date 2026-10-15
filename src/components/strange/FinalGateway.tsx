import type { FC } from 'react';
import { Link } from 'react-router-dom';
import type { EventSummary } from '../../lib/types';
import { FESTIVAL_CONFIG } from '../../config/festival';

export interface FinalGatewayProps {
  events: EventSummary[];
}

/**
 * Scene 7: Final Gateway
 * - Large portal opening onto a bright unfamiliar world (SVG/CSS)
 * - Heading: "YOUR NEXT REALITY STARTS HERE."
 * - Button: "REGISTER FOR STRANGE" with a small inline-SVG up-right arrow
 * - Target: festival.ts registrationUrl if set (link out, rel="noopener");
 *   otherwise /events?registration=OPEN and a plain line stating real registration status
 * - Portal light fades cleanly into the footer
 */
export const FinalGateway: FC<FinalGatewayProps> = ({ events }) => {
  const openCount = events.filter((e) => e.registration_status === 'OPEN').length;
  const registrationUrl = FESTIVAL_CONFIG.registrationUrl;

  return (
    <section
      id="final-gateway"
      className="relative w-full py-20 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-[#07060D] flex flex-col items-center justify-center overflow-hidden"
      aria-labelledby="gateway-heading"
    >
      {/* Background Large Portal Opening onto Bright Unfamiliar World */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[750px] md:w-[900px] h-[600px] sm:h-[750px] md:h-[900px] pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        {/* Ambient Portal Radiance */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,122,26,0.18)_0%,rgba(245,182,66,0.1)_40%,rgba(61,220,151,0.06)_60%,transparent_75%)]" />

        {/* Vector Portal Artwork with Bright Horizon */}
        <svg
          viewBox="0 0 600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <radialGradient id="gateway-aperture" cx="50%" cy="45%" r="50%">
              <stop offset="0%" stopColor="#FFF9C4" />
              <stop offset="25%" stopColor="#FFE082" />
              <stop offset="50%" stopColor="#FF7A1A" />
              <stop offset="75%" stopColor="#7E22CE" />
              <stop offset="100%" stopColor="#07060D" />
            </radialGradient>
            <linearGradient id="gateway-fiery-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#FFE082" />
              <stop offset="70%" stopColor="#FF7A1A" />
              <stop offset="100%" stopColor="#D84315" />
            </linearGradient>
          </defs>

          {/* Aperture Core */}
          <circle cx="300" cy="300" r="210" fill="url(#gateway-aperture)" fillOpacity="0.8" />

          {/* Horizon & Distant Futuristic Mountain Ridges */}
          <g opacity="0.6">
            <path d="M120 360 L220 280 L290 320 L370 260 L480 360 Z" fill="#2E1065" />
            <path d="M100 370 L180 320 L270 350 L340 310 L420 350 L500 370 Z" fill="#1E1B4B" />
          </g>

          {/* Molten Outer Ring Arcs */}
          <circle
            cx="300"
            cy="300"
            r="230"
            stroke="url(#gateway-fiery-ring)"
            strokeWidth="5"
            strokeDasharray="140 40 220 50"
            strokeLinecap="round"
          />
          <circle
            cx="300"
            cy="300"
            r="240"
            stroke="#FF7A1A"
            strokeWidth="8"
            strokeDasharray="60 120 90 80"
            strokeLinecap="round"
            strokeOpacity="0.75"
          />
          <circle
            cx="300"
            cy="300"
            r="224"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeDasharray="30 20 80 40"
            strokeOpacity="0.9"
          />
        </svg>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7A1A]/10 border border-[#FF7A1A]/40">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A1A] animate-ping" />
          <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-[#FF7A1A]">
            Temporal Nexus
          </span>
        </div>

        <h2
          id="gateway-heading"
          className="text-3xl sm:text-5xl md:text-6xl font-display font-bold text-[#F3EFE8] tracking-wider leading-tight drop-shadow-xl"
        >
          YOUR NEXT REALITY
          <br />
          <span className="text-[#FF7A1A]">STARTS HERE.</span>
        </h2>

        {/* Real Status Line */}
        <p className="text-sm sm:text-base md:text-lg text-[#B8B3C7] max-w-xl font-medium">
          {openCount > 0 ? (
            <>
              Registration is open for <span className="text-[#3DDC97] font-semibold">{openCount} events</span>. Secure your dimensional coordinate.
            </>
          ) : (
            <>
              Registration is currently closed across all events. Explore the multiverse index for updates.
            </>
          )}
        </p>

        {/* Primary Action Button */}
        <div className="pt-4 flex flex-col items-center gap-3">
          {registrationUrl ? (
            <a
              href={registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 sm:px-10 py-4 rounded-md bg-[#FF7A1A] text-[#07060D] font-display font-bold text-sm sm:text-base uppercase tracking-wider hover:bg-[#F5B642] transition-colors shadow-[0_0_30px_rgba(255,122,26,0.6)] border border-[#FFE082] active:scale-95"
            >
              <span>REGISTER FOR STRANGE</span>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
          ) : (
            <Link
              to="/events?registration=OPEN"
              className="inline-flex items-center gap-2.5 px-8 sm:px-10 py-4 rounded-md bg-[#FF7A1A] text-[#07060D] font-display font-bold text-sm sm:text-base uppercase tracking-wider hover:bg-[#F5B642] transition-colors shadow-[0_0_30px_rgba(255,122,26,0.6)] border border-[#FFE082] active:scale-95"
            >
              <span>REGISTER FOR STRANGE</span>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </Link>
          )}

          {/* Secondary reassurance / link */}
          <Link
            to="/events"
            className="text-xs font-mono tracking-wider uppercase text-[#B8B3C7] hover:text-[#F5B642] transition-colors underline underline-offset-4"
          >
            Or browse all {events.length} dimensional challenges
          </Link>
        </div>
      </div>

      {/* Bottom Gradient Fade: blends seamlessly into Footer */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#07060D] to-transparent pointer-events-none z-10" />
    </section>
  );
};
