import { useEffect, useRef, useState, type FC } from 'react';
import { Link } from 'react-router-dom';
import { EventCard } from '../events/EventCard';
import type { EventSummary } from '../../lib/types';

export interface FeaturedMultiverseProps {
  events: EventSummary[];
}

export const FeaturedMultiverse: FC<FeaturedMultiverseProps> = ({ events }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackWrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Select priority events: is_featured + ACTIVE + OPEN first, then fallback upcoming
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

  const featuredEvents = eligible.slice(0, 8);
  const shouldRender = eligible.length >= 3;

  // GSAP ScrollTrigger horizontal scrub: moves track sideways as page scrolls vertically
  // (hover:hover) + (pointer:fine) + no reduced motion, NO pinning, transform only
  useEffect(() => {
    if (typeof window === 'undefined' || !shouldRender) return;

    let ctx: gsap.Context | null = null;
    let resizeTimer: number;

    const initScrollTrigger = async () => {
      try {
        const { gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          const mm = gsap.matchMedia();

          mm.add(
            '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
            () => {
              const track = trackRef.current;
              const section = sectionRef.current;
              const wrapper = trackWrapperRef.current;
              if (!track || !section || !wrapper) return;

              const getDistance = () => {
                const total = track.scrollWidth;
                const visible = wrapper.clientWidth;
                return Math.max(0, total - visible + 48); // add right padding allowance
              };

              gsap.to(track, {
                x: () => -getDistance(),
                ease: 'none',
                scrollTrigger: {
                  trigger: section,
                  start: 'top 85%',
                  end: 'bottom 15%',
                  scrub: 1,
                  invalidateOnRefresh: true,
                },
              });

              // Initial refresh once DOM measurements settle
              ScrollTrigger.refresh();
            }
          );
        }, sectionRef);
      } catch (err) {
        console.warn('GSAP ScrollTrigger horizontal scroll enhancement skipped:', err);
      }
    };

    // Initialize after first paint
    const timer = setTimeout(initScrollTrigger, 60);

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(async () => {
        try {
          const { ScrollTrigger } = await import('gsap/ScrollTrigger');
          ScrollTrigger.refresh();
        } catch {
          // Ignore
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      ctx?.revert();
    };
  }, [featuredEvents.length, shouldRender]);

  // Track scroll state for manual buttons on touch/fallback
  const updateScrollState = () => {
    const el = trackWrapperRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scrollByAmount = (direction: 'left' | 'right') => {
    const el = trackWrapperRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -360 : 360;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // Keyboard accessibility: focusing an off-screen card brings it into view
  const handleCardFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  // Spec: Hide the section if fewer than 3 events
  if (!shouldRender) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-16 sm:py-24 bg-[#07060D] overflow-hidden"
      aria-labelledby="featured-multiverse-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
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

          <div className="flex items-center gap-4">
            {/* Fallback & Touch Navigation Prev/Next Buttons */}
            <div className="flex items-center gap-1.5" aria-label="Featured events navigation">
              <button
                type="button"
                onClick={() => scrollByAmount('left')}
                disabled={!canScrollLeft}
                aria-label="Previous featured event"
                className="p-2 rounded-lg bg-[#0D1020] border border-white/10 text-[#F3EFE8] disabled:opacity-30 disabled:pointer-events-none hover:border-[#FF7A1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount('right')}
                disabled={!canScrollRight}
                aria-label="Next featured event"
                className="p-2 rounded-lg bg-[#0D1020] border border-white/10 text-[#F3EFE8] disabled:opacity-30 disabled:pointer-events-none hover:border-[#FF7A1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <Link
              to="/events"
              className="text-xs font-bold uppercase tracking-wider text-[#F5B642] hover:text-[#FF7A1A] transition-colors"
            >
              View all events
            </Link>
          </div>
        </div>

        {/* Single Horizontal Row: Moves sideways as page scrolls vertically (GSAP)
            with native overflow-x scroll-snap track fallback for touch / reduced-motion */}
        <div
          ref={trackWrapperRef}
          onScroll={updateScrollState}
          className="relative w-full overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 scrollbar-none"
          tabIndex={0}
          role="region"
          aria-label="Featured events horizontal carousel"
        >
          <div
            ref={trackRef}
            className="flex gap-6 items-stretch w-max will-change-transform"
          >
            {featuredEvents.map((event, index) => (
              <div
                key={event.id}
                onFocus={handleCardFocus}
                className="w-[280px] sm:w-[320px] md:w-[360px] shrink-0 snap-start flex flex-col"
              >
                <EventCard
                  event={event}
                  priority={index < 2}
                  className="h-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
