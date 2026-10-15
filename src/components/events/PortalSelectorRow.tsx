import { useState, type FC } from 'react';
import type { RealmDefinition, RealmId } from '../../lib/realms';
import { RealmWorldSvg } from '../strange/RealmWorldSvg';

export interface PortalSelectorRowProps {
  realms: RealmDefinition[];
  selectedRealms: RealmId[];
  onToggleRealm: (id: RealmId) => void;
  className?: string;
}

/**
 * Stage 2: Interactive Realm Portal Selector Row
 * - One interactive portal per realm (from realms.ts)
 * - Multi-select toggle <button aria-pressed>
 * - Number, Name, Descriptor, Real Count (Always visible, never hover-only)
 * - Idle: soft glow, sparse sparks
 * - Hover/focus: brighter ring, sparks trace circumference, inner world shifts
 * - Select: ring expands briefly (<=300ms), selected portals stay highlighted with realm tint
 * - Mobile: compact 2x2 grid, Desktop: 4-column row
 */
export const PortalSelectorRow: FC<PortalSelectorRowProps> = ({
  realms,
  selectedRealms,
  onToggleRealm,
  className = '',
}) => {
  // Track recently clicked portal ID for brief <=300ms expansion animation
  const [pulseId, setPulseId] = useState<RealmId | null>(null);

  const handleClick = (id: RealmId) => {
    setPulseId(id);
    setTimeout(() => {
      setPulseId((curr) => (curr === id ? null : curr));
    }, 280);
    onToggleRealm(id);
  };

  return (
    <div
      className={`w-full ${className}`}
      role="region"
      aria-label="Multiverse Realm Filters"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {realms.map((realm, index) => {
          const isSelected = selectedRealms.includes(realm.id);
          const isPulsing = pulseId === realm.id;
          const numberStr = String(index + 1).padStart(2, '0');

          return (
            <button
              key={realm.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => handleClick(realm.id)}
              className={`group relative flex flex-col items-center text-center p-3 sm:p-4 rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] cursor-pointer select-none ${
                isSelected
                  ? 'bg-[#0D1020] border-2 shadow-lg'
                  : 'bg-[#07060D]/90 border border-white/10 hover:border-[#F5B642]/50 hover:bg-[#0D1020]/60'
              } ${isPulsing ? 'scale-[1.03]' : 'scale-100'}`}
              style={{
                borderColor: isSelected ? realm.accentColor : undefined,
                boxShadow: isSelected
                  ? `0 0 25px ${realm.bgTint}, 0 8px 30px rgba(0,0,0,0.8)`
                  : undefined,
              }}
            >
              {/* Top Row: Realm Index Number & Active Indicator Pill */}
              <div className="w-full flex items-center justify-between px-1 mb-2">
                <span className="font-mono text-[10px] sm:text-xs font-bold text-[#B8B3C7] tracking-wider">
                  #{numberStr}
                </span>

                {isSelected ? (
                  <span
                    className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-sm"
                    style={{
                      color: realm.accentColor,
                      borderColor: realm.accentColor,
                      backgroundColor: realm.bgTint,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: realm.accentColor }} />
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-xs font-mono text-[#B8B3C7]/80">
                    {realm.count} {realm.count === 1 ? 'event' : 'events'}
                  </span>
                )}
              </div>

              {/* Portal Artwork Ring Container */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center p-1.5 my-1">
                {/* Outer Glow Halo */}
                <div
                  className={`absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none ${
                    isSelected
                      ? 'opacity-80'
                      : 'opacity-20 group-hover:opacity-60 group-focus-visible:opacity-60'
                  }`}
                  style={{
                    background: `radial-gradient(circle, ${realm.accentColor}30 0%, transparent 70%)`,
                  }}
                />

                {/* Fiery Portal Ring SVG */}
                <svg
                  viewBox="0 0 160 160"
                  className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
                  aria-hidden="true"
                >
                  <g
                    className="group-hover:animate-spell-spin transition-transform duration-700"
                    style={{ transformOrigin: 'center' }}
                  >
                    {/* Outer Plasma Arc */}
                    <circle
                      cx="80"
                      cy="80"
                      r="74"
                      stroke={realm.accentColor}
                      strokeWidth={isSelected ? '4' : '2.5'}
                      strokeDasharray="30 10 50 15 25 10"
                      strokeLinecap="round"
                      strokeOpacity={isSelected ? '1' : '0.8'}
                    />
                    {/* Inner Gold Arc */}
                    <circle
                      cx="80"
                      cy="80"
                      r="69"
                      stroke="#FFE5A3"
                      strokeWidth="1.2"
                      strokeDasharray="15 30 10 20"
                      strokeOpacity={isSelected ? '0.9' : '0.5'}
                    />
                    {/* Ring Sparks */}
                    <circle cx="154" cy="80" r="2" fill="#FFFFFF" />
                    <circle cx="80" cy="6" r="1.8" fill="#FFE082" />
                  </g>
                </svg>

                {/* Interior Realm SVG World */}
                <div
                  className={`relative w-[84%] h-[84%] rounded-full overflow-hidden shadow-inner transition-transform duration-300 ${
                    isSelected ? 'scale-105' : 'group-hover:scale-105 group-focus-visible:scale-105'
                  }`}
                >
                  <RealmWorldSvg realmId={realm.id} />
                </div>
              </div>

              {/* Text Labels: Name, Descriptor, and Matching Count (Always Visible) */}
              <div className="w-full flex flex-col items-center mt-2">
                <span
                  className="font-display font-bold text-xs sm:text-sm tracking-wide text-[#F3EFE8] group-hover:text-[#F5B642] transition-colors leading-tight"
                  style={{ color: isSelected ? realm.accentColor : undefined }}
                >
                  {realm.name}
                </span>

                <span className="text-[10px] sm:text-[11px] text-[#B8B3C7] mt-1 line-clamp-1 max-w-[160px] leading-tight">
                  {realm.descriptor}
                </span>

                {isSelected && (
                  <span className="text-[10px] font-mono text-[#F5B642] mt-1 font-semibold">
                    {realm.count} available
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
