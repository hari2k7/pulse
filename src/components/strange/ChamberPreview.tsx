import { useMemo, type FC } from 'react';
import { Link } from 'react-router-dom';
import type { EventSummary } from '../../lib/types';
import { getRealms } from '../../lib/realms';
import { RealmWorldSvg } from './RealmWorldSvg';

export interface ChamberPreviewProps {
  events: EventSummary[];
}

/**
 * Scene 3: Multiverse Chamber Preview
 * - Heading: "EVERY REALITY HAS AN EVENT."
 * - Subline: "Choose your universe. Discover what awaits beyond it."
 * - Floating portals at varying depths over an engraved concentric floor and column silhouettes
 * - Real <a> to /events?realm={id}
 * - Real live event counts, labels always visible
 * - Desktop staggered depths, Mobile 2x2 compact grid
 */
export const ChamberPreview: FC<ChamberPreviewProps> = ({ events }) => {
  const realms = useMemo(() => getRealms(events), [events]);

  return (
    <section
      id="chamber-preview"
      className="relative w-full py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-[#07060D] overflow-hidden"
      aria-labelledby="chamber-heading"
    >
      {/* Background Architectural Layer: Engraved Concentric Floor & Column Silhouettes */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 opacity-20" aria-hidden="true">
        <svg
          viewBox="0 0 1200 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Concentric Floor Rings */}
          <ellipse cx="600" cy="550" rx="550" ry="140" stroke="#F5B642" strokeWidth="1.5" strokeOpacity="0.4" />
          <ellipse cx="600" cy="550" rx="420" ry="105" stroke="#FF7A1A" strokeWidth="1.2" strokeOpacity="0.3" strokeDasharray="8 6" />
          <ellipse cx="600" cy="550" rx="280" ry="70" stroke="#F5B642" strokeWidth="1" strokeOpacity="0.5" />
          <ellipse cx="600" cy="550" rx="140" ry="35" stroke="#3DDC97" strokeWidth="1" strokeOpacity="0.4" />

          {/* Perspective Rays from Center Floor */}
          <line x1="600" y1="550" x2="100" y2="600" stroke="#F5B642" strokeWidth="1" strokeOpacity="0.3" />
          <line x1="600" y1="550" x2="350" y2="600" stroke="#F5B642" strokeWidth="1" strokeOpacity="0.2" />
          <line x1="600" y1="550" x2="850" y2="600" stroke="#F5B642" strokeWidth="1" strokeOpacity="0.2" />
          <line x1="600" y1="550" x2="1100" y2="600" stroke="#F5B642" strokeWidth="1" strokeOpacity="0.3" />

          {/* Column Silhouettes in the Distance */}
          <rect x="80" y="50" width="30" height="500" fill="#121524" />
          <rect x="180" y="80" width="22" height="470" fill="#0C0E18" />
          <rect x="1090" y="50" width="30" height="500" fill="#121524" />
          <rect x="998" y="80" width="22" height="470" fill="#0C0E18" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-3xl mb-12 sm:mb-16">
          <h2
            id="chamber-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#F3EFE8] tracking-wider leading-tight"
          >
            EVERY REALITY HAS AN EVENT.
          </h2>
          <p className="mt-3 text-sm sm:text-base md:text-lg text-[#B8B3C7] font-medium tracking-wide">
            Choose your universe. Discover what awaits beyond it.
          </p>
        </div>

        {/* Portals: Desktop Staggered Depths, Mobile 2x2 Grid */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-center">
          {realms.map((realm, idx) => {
            // Slight staggered vertical depths for desktop floating effect
            const depthClasses = [
              'md:translate-y-2',
              'md:-translate-y-4',
              'md:translate-y-4',
              'md:-translate-y-2',
            ][idx % 4];

            return (
              <Link
                key={realm.id}
                to={`/events?realm=${realm.id}`}
                className={`group relative flex flex-col items-center p-4 sm:p-5 rounded-xl bg-[#07060D]/90 border border-white/10 hover:border-[#F5B642]/60 focus-visible:border-[#FF7A1A] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] ${depthClasses}`}
                style={{
                  boxShadow: `0 8px 30px rgba(0, 0, 0, 0.7), 0 0 1px ${realm.accentColor}`,
                }}
              >
                {/* Realm Accent Corner Flairs */}
                <div
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 rotate-45 border-t border-r pointer-events-none"
                  style={{ borderColor: realm.accentColor }}
                  aria-hidden="true"
                />
                <div
                  className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rotate-45 border-b border-l pointer-events-none"
                  style={{ borderColor: realm.accentColor }}
                  aria-hidden="true"
                />

                {/* Floating Portal Ring Frame */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full flex items-center justify-center p-2 mb-4">
                  {/* Outer Pulsing Corona */}
                  <div
                    className="absolute inset-0 rounded-full opacity-40 group-hover:opacity-90 group-focus-visible:opacity-90 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${realm.accentColor}25 0%, transparent 70%)`,
                    }}
                  />

                  {/* Molten Fiery Ring SVG with Sparks */}
                  <svg
                    viewBox="0 0 200 200"
                    className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
                    aria-hidden="true"
                  >
                    <g
                      className="group-hover:animate-spell-spin transition-transform duration-700"
                      style={{ transformOrigin: 'center' }}
                    >
                      <circle
                        cx="100"
                        cy="100"
                        r="92"
                        stroke={realm.accentColor}
                        strokeWidth="3.5"
                        strokeDasharray="40 15 70 20"
                        strokeLinecap="round"
                        strokeOpacity="0.85"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="86"
                        stroke="#FFE5A3"
                        strokeWidth="1.5"
                        strokeDasharray="20 40 10 30"
                        strokeOpacity="0.7"
                      />
                      <circle cx="192" cy="100" r="2.5" fill="#FFFFFF" />
                      <circle cx="100" cy="8" r="2" fill="#FFE082" />
                    </g>
                  </svg>

                  {/* Interior Realm SVG World (shifts subtly on hover/focus) */}
                  <div className="relative w-[85%] h-[85%] rounded-full overflow-hidden shadow-inner transform transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1 group-focus-visible:scale-105">
                    <RealmWorldSvg realmId={realm.id} />
                  </div>
                </div>

                {/* Always-Visible Realm Content Labels */}
                <div className="w-full text-center flex flex-col items-center">
                  <span
                    className="text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border mb-1.5"
                    style={{
                      color: realm.accentColor,
                      borderColor: `${realm.accentColor}40`,
                      backgroundColor: `${realm.accentColor}15`,
                    }}
                  >
                    {realm.count} {realm.count === 1 ? 'Event' : 'Events'}
                  </span>

                  <h3 className="font-display font-bold text-base sm:text-lg text-[#F3EFE8] group-hover:text-[#F5B642] transition-colors leading-snug">
                    {realm.name}
                  </h3>

                  <p className="text-[11px] sm:text-xs text-[#B8B3C7] mt-1 line-clamp-2 max-w-[180px] leading-relaxed">
                    {realm.descriptor}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
