import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../ui/StatusBadge';
import { formatPrice, formatDateIST } from '../../lib/format';
import { getOptimizedImageUrl } from '../../lib/images';
import type { EventSummary } from '../../lib/types';

export interface FeaturedMultiverseProps {
  events: EventSummary[];
}

export const FeaturedMultiverse: FC<FeaturedMultiverseProps> = ({ events }) => {
  // Select priority events: is_featured + ACTIVE + OPEN first, then remaining ACTIVE
  const eligible = [...events].sort((a, b) => {
    const aScore = (a.is_featured ? 4 : 0) + (a.registration_status === 'OPEN' ? 2 : 0) + (a.event_status === 'ACTIVE' ? 1 : 0);
    const bScore = (b.is_featured ? 4 : 0) + (b.registration_status === 'OPEN' ? 2 : 0) + (b.event_status === 'ACTIVE' ? 1 : 0);
    return bScore - aScore;
  });

  if (eligible.length === 0) {
    return null;
  }

  // Layout allocation:
  // 1 Flagship Event (large, cinematic)
  // 2 Staggered Pair Events
  // 3 Compact Strip Events
  const flagship = eligible[0];
  const pair = eligible.slice(1, 3);
  const strip = eligible.slice(3, 6);

  return (
    <section className="relative w-full py-16 sm:py-24 bg-[#07060D] px-4 sm:px-6 lg:px-8" aria-labelledby="featured-multiverse-heading">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#FF7A1A]/20 pb-6">
          <h2 id="featured-multiverse-heading" className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#F3EFE8]">
            FEATURED EVENTS
          </h2>
          <Link
            to="/events"
            className="text-xs font-bold uppercase tracking-wider text-[#F5B642] hover:text-[#FF7A1A] transition-colors"
          >
            View All Events
          </Link>
        </div>

        {/* 1. Flagship Event (Asymmetric Hero Card) */}
        {flagship && (
          <div className="group relative rounded-xl bg-[#0D1020] border border-[#FF7A1A]/30 overflow-hidden shadow-2xl transition-all duration-300 hover:border-[#FF7A1A]">
            <Link to={`/events/${flagship.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-center">
                {/* 3:2 Image with explicit aspect ratio */}
                <div className="lg:col-span-7 relative aspect-[3/2] w-full overflow-hidden bg-[#07060D]">
                  <img
                    src={getOptimizedImageUrl(flagship.cover_image_url, 900, 600)}
                    alt={flagship.cover_image_alt || flagship.name}
                    width={900}
                    height={600}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent via-[#0D1020]/40 to-[#0D1020]" />
                  {/* Category Accent Badge */}
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#07060D]/85 border border-[#FF7A1A]/50 text-[#F5B642]">
                    Flagship • {flagship.category}
                  </span>
                </div>

                {/* Content Panel */}
                <div className="lg:col-span-5 p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {flagship.registration_status && (
                        <StatusBadge type="registration" status={flagship.registration_status} size="sm" />
                      )}
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-[#1A1030] text-[#B8B3C7] border border-white/10">
                        {formatPrice(flagship.price, flagship.is_per_head)}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#F3EFE8] leading-snug group-hover:text-[#FF7A1A] transition-colors">
                      {flagship.name}
                    </h3>

                    {flagship.blurb && (
                      <p className="text-sm text-[#B8B3C7] line-clamp-3 leading-relaxed">
                        {flagship.blurb}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-[#B8B3C7]">
                    <span>{formatDateIST(flagship.schedule_summary)}</span>
                    <span className="font-bold text-[#FF7A1A] text-xs">
                      View Event
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* 2. Staggered Pair Layout */}
        {pair.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pair.map((event) => (
              <div
                key={event.id}
                className="group relative rounded-xl bg-[#0D1020] border border-white/10 overflow-hidden shadow-xl transition-all duration-300 hover:border-[#FF7A1A]/60 hover:-translate-y-1"
              >
                <Link to={`/events/${event.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]">
                  <div className="relative aspect-[3/2] w-full overflow-hidden bg-[#07060D]">
                    <img
                      src={getOptimizedImageUrl(event.cover_image_url, 600, 400)}
                      alt={event.cover_image_alt || event.name}
                      width={600}
                      height={400}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1020] via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#07060D]/85 border border-[#3BA3FF]/40 text-[#3BA3FF]">
                      {event.category}
                    </span>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      {event.registration_status && (
                        <StatusBadge type="registration" status={event.registration_status} size="sm" />
                      )}
                      <span className="text-xs font-semibold text-[#B8B3C7]">
                        {formatPrice(event.price, event.is_per_head)}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-xl text-[#F3EFE8] line-clamp-2 group-hover:text-[#F5B642] transition-colors">
                      {event.name}
                    </h3>

                    {event.blurb && (
                      <p className="text-xs text-[#B8B3C7] line-clamp-2 leading-relaxed">
                        {event.blurb}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-[#B8B3C7]">
                      <span>{formatDateIST(event.schedule_summary)}</span>
                      <span className="font-semibold text-[#FF7A1A]">View Event</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* 3. Compact Strip Layout */}
        {strip.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {strip.map((event) => (
              <div
                key={event.id}
                className="group flex flex-col justify-between p-5 rounded-lg bg-[#0D1020]/60 border border-white/5 hover:border-[#FF7A1A]/40 transition-all hover:-translate-y-0.5"
              >
                <Link to={`/events/${event.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]">
                  <div className="flex items-center justify-between gap-2 text-xs mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A66BFF]">
                      {event.category}
                    </span>
                    {event.registration_status && (
                      <StatusBadge type="registration" status={event.registration_status} size="sm" />
                    )}
                  </div>

                  <h4 className="font-display font-bold text-base text-[#F3EFE8] line-clamp-2 group-hover:text-[#FF7A1A] transition-colors mb-2">
                    {event.name}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-[#B8B3C7] pt-3 border-t border-white/5 mt-4">
                    <span>{formatDateIST(event.schedule_summary)}</span>
                    <span className="text-[#F5B642] font-medium">View Event</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
