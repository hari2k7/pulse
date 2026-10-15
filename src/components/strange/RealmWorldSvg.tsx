import type { FC } from 'react';
import type { RealmId } from '../../lib/realms';

export interface RealmWorldSvgProps {
  realmId: RealmId;
  className?: string;
}

/**
 * Realm-Specific SVG World Scenes
 * Pure vector SVG artworks depicting the unique dimensional realm landscapes:
 * - Creation (Green #3DDC97): Bio-technic greenhouse, glowing circuit vines, hexagonal matrices
 * - Challenge (Orange #FF7A1A): Volcanic cyber-arena, floating geometric polyhedrons, neon wireframe grid
 * - Tech (Blue #3BA3FF): Orbital observatory, planetary rings, celestial star-chart armillary
 * - Unbound (Violet #A66BFF): Mystical twilight realm, floating celestial library, crystalline prisms
 */
export const RealmWorldSvg: FC<RealmWorldSvgProps> = ({ realmId, className = '' }) => {
  switch (realmId) {
    case 'creation':
      return (
        <svg
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`w-full h-full object-cover ${className}`}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="creation-sky" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#0B2E21" />
              <stop offset="60%" stopColor="#051711" />
              <stop offset="100%" stopColor="#020806" />
            </radialGradient>
            <linearGradient id="creation-glow" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#3DDC97" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3DDC97" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="240" height="240" fill="url(#creation-sky)" />

          {/* Hexagonal Solar Matrix Pattern */}
          <g stroke="#3DDC97" strokeWidth="1" strokeOpacity="0.25">
            <polygon points="120,40 145,55 145,85 120,100 95,85 95,55" fill="none" />
            <polygon points="170,70 195,85 195,115 170,130 145,115 145,85" fill="none" />
            <polygon points="70,70 95,85 95,115 70,130 45,115 45,85" fill="none" />
            <polygon points="120,100 145,115 145,145 120,160 95,145 95,115" fill="none" />
          </g>

          {/* Central Bio-Mechanical Tree / Core */}
          <path
            d="M120 240 V130 M120 160 Q80 130 60 90 M120 150 Q160 120 180 85 M120 180 Q90 170 75 150 M120 175 Q150 165 165 145"
            stroke="#3DDC97"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Glowing Circuit Node Pods */}
          <circle cx="120" cy="130" r="5" fill="#3DDC97" />
          <circle cx="60" cy="90" r="4" fill="#A3F7BF" />
          <circle cx="180" cy="85" r="4" fill="#A3F7BF" />
          <circle cx="75" cy="150" r="3" fill="#3DDC97" />
          <circle cx="165" cy="145" r="3" fill="#3DDC97" />

          {/* Bio Horizon Ground Glow */}
          <ellipse cx="120" cy="225" rx="100" ry="25" fill="url(#creation-glow)" />
        </svg>
      );

    case 'challenge':
      return (
        <svg
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`w-full h-full object-cover ${className}`}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="challenge-sky" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#3A1705" />
              <stop offset="60%" stopColor="#1A0A02" />
              <stop offset="100%" stopColor="#0A0401" />
            </radialGradient>
            <linearGradient id="challenge-grid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF7A1A" stopOpacity="0" />
              <stop offset="100%" stopColor="#FF7A1A" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <rect width="240" height="240" fill="url(#challenge-sky)" />

          {/* Floating Geometric Polyhedrons */}
          <g stroke="#FF7A1A" strokeWidth="1.5">
            {/* Central Octahedron */}
            <polygon points="120,50 160,95 120,140 80,95" fill="#FF7A1A" fillOpacity="0.1" />
            <line x1="80" y1="95" x2="160" y2="95" strokeDasharray="3 3" />
            <line x1="120" y1="50" x2="120" y2="140" strokeOpacity="0.6" />

            {/* Smaller Satellites */}
            <polygon points="50,60 70,80 50,100 30,80" strokeOpacity="0.6" fill="none" />
            <polygon points="190,65 210,85 190,105 170,85" strokeOpacity="0.6" fill="none" />
          </g>

          {/* Perspective Wireframe Arena Grid */}
          <g stroke="url(#challenge-grid)" strokeWidth="1">
            <line x1="120" y1="140" x2="10" y2="240" />
            <line x1="120" y1="140" x2="60" y2="240" />
            <line x1="120" y1="140" x2="120" y2="240" strokeWidth="1.5" />
            <line x1="120" y1="140" x2="180" y2="240" />
            <line x1="120" y1="140" x2="230" y2="240" />

            <line x1="90" y1="170" x2="150" y2="170" />
            <line x1="65" y1="195" x2="175" y2="195" />
            <line x1="35" y1="220" x2="205" y2="220" strokeWidth="1.5" />
          </g>

          {/* Glowing Monolith Pillars */}
          <rect x="25" y="125" width="8" height="60" fill="#FF7A1A" fillOpacity="0.5" />
          <rect x="207" y="125" width="8" height="60" fill="#FF7A1A" fillOpacity="0.5" />
        </svg>
      );

    case 'tech':
      return (
        <svg
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`w-full h-full object-cover ${className}`}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="tech-sky" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#0B203E" />
              <stop offset="60%" stopColor="#051020" />
              <stop offset="100%" stopColor="#02050B" />
            </radialGradient>
          </defs>
          <rect width="240" height="240" fill="url(#tech-sky)" />

          {/* Star Chart Armillary Rings */}
          <circle cx="120" cy="115" r="70" stroke="#3BA3FF" strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="4 4" />
          <ellipse cx="120" cy="115" rx="75" ry="28" stroke="#3BA3FF" strokeWidth="1.5" strokeOpacity="0.8" transform="rotate(-25 120 115)" />
          <ellipse cx="120" cy="115" rx="75" ry="28" stroke="#60A5FA" strokeWidth="1" strokeOpacity="0.6" transform="rotate(35 120 115)" />

          {/* Planetary Core */}
          <circle cx="120" cy="115" r="22" fill="#1D4ED8" stroke="#93C5FD" strokeWidth="1.5" />
          <circle cx="126" cy="109" r="6" fill="#93C5FD" fillOpacity="0.6" />

          {/* Constellation Nodes */}
          <g fill="#FFFFFF">
            <circle cx="65" cy="55" r="1.5" />
            <circle cx="175" cy="45" r="1.5" />
            <circle cx="195" cy="140" r="1.5" />
            <circle cx="45" cy="150" r="1.5" />
            <circle cx="120" cy="35" r="2" fill="#60A5FA" />
          </g>

          {/* Orbital Dish / Horizon Silhouette */}
          <path
            d="M30 240 C60 190 180 190 210 240 Z"
            fill="#061226"
            stroke="#3BA3FF"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
        </svg>
      );

    case 'unbound':
    default:
      return (
        <svg
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`w-full h-full object-cover ${className}`}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="unbound-sky" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#250F40" />
              <stop offset="60%" stopColor="#120621" />
              <stop offset="100%" stopColor="#06020D" />
            </radialGradient>
          </defs>
          <rect width="240" height="240" fill="url(#unbound-sky)" />

          {/* Mystic Spiral Galaxy */}
          <g stroke="#A66BFF" strokeWidth="1.2" strokeOpacity="0.5">
            <path d="M120 110 A15 15 0 0 1 135 125 A30 30 0 0 1 105 155 A50 50 0 0 1 70 105 A75 75 0 0 1 145 45" />
            <path d="M120 120 A10 10 0 0 1 110 110 A25 25 0 0 1 135 85 A45 45 0 0 1 165 130 A65 65 0 0 1 100 185" strokeOpacity="0.3" />
          </g>

          {/* Floating Prism Islands */}
          <polygon points="60,140 100,150 80,175 40,165" fill="#1E0E35" stroke="#C084FC" strokeWidth="1.2" />
          <polygon points="140,135 190,145 170,170 120,160" fill="#1E0E35" stroke="#C084FC" strokeWidth="1.2" />
          <polygon points="90,80 130,85 115,105 75,100" fill="#2E1055" stroke="#E9D5FF" strokeWidth="1.5" />

          {/* Starlight Crystals */}
          <circle cx="115" cy="75" r="3" fill="#E9D5FF" />
          <circle cx="80" cy="140" r="2" fill="#C084FC" />
          <circle cx="160" cy="135" r="2.5" fill="#E9D5FF" />
        </svg>
      );
  }
};
