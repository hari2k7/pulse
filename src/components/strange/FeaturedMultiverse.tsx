import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { EventCard } from '../events/EventCard';
import type { EventSummary } from '../../lib/types';

export interface FeaturedMultiverseProps {
  events: EventSummary[];
}

export const FeaturedMultiverse: FC<FeaturedMultiverseProps> = ({ events }) => {
  // Select priority events: is_featured + ACTIVE + OPEN first, then remaining ACTIVE
  const eligible = [...events].sort((a, b) => {
    const aScore =
      (a.is_featured ? 4 : 0) +
      (a.registration_status === 'OPEN' ? 2 : 0) +
      (a.event_status === 'ACTIVE' ? 1 : 0);
    const bScore =
      (b.is_featured ? 4 : 0) +
      (b.registration_status === 'OPEN' ? 2 : 0) +
      (b.event_status === 'ACTIVE' ? 1 : 0);
    return bScore - aScore;
  });

  if (eligible.length === 0) {
    return null;
  }

  const featuredEvents = eligible.slice(0, 6);

  return (
    <section
      className="relative w-full py-16 sm:py-24 bg-[#07060D] px-4 sm:px-6 lg:px-8"
      aria-labelledby="featured-multiverse-heading"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#FF7A1A]/20 pb-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF7A1A] block mb-1">
              Curated Dimensions
            </span>
            <h2
              id="featured-multiverse-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#F3EFE8]"
            >
              FEATURED EVENTS
            </h2>
          </div>
          <Link
            to="/events"
            className="text-xs font-bold uppercase tracking-wider text-[#F5B642] hover:text-[#FF7A1A] transition-colors"
          >
            View All Events &rarr;
          </Link>
        </div>

        {/* Shared EventCard Grid with Wide Flagship Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {featuredEvents.map((event, index) => {
            const isFlagshipSpan = index === 0;
            return (
              <div
                key={event.id}
                className={isFlagshipSpan ? 'sm:col-span-2 lg:col-span-2' : ''}
              >
                <EventCard
                  event={event}
                  priority={index < 3}
                  isFlagshipSpan={isFlagshipSpan}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
