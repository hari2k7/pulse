import { useEffect, useRef, useState, type FC } from 'react';
import { Link } from 'react-router-dom';
import { EventCard } from '../events/EventCard';
import type { EventSummary } from '../../lib/types';
import { runAfterLoadAndIdle } from '../../lib/idle';

export interface FeaturedMultiverseProps {
  events: EventSummary[];
}

export const FeaturedMultiverse: FC<FeaturedMultiverseProps> = ({ events }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyContainerRef = useRef<HTMLDivElement>(null);
  const trackWrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [paddingLeft, setPaddingLeft] = useState(16);
  const [sectionHeight, setSectionHeight] = useState<string>('auto');

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

  const featuredEvents = eligible.slice(0, 6);
  const shouldRender = eligible.length >= 3;

  // Calculate container padding-left so first card aligns perfectly with page container heading
  useEffect(() => {
    const updatePadding = () => {
      const vw = window.innerWidth;
      const maxW = 1280; // max-w-7xl
      if (vw <= maxW) {
        setPaddingLeft(vw >= 1024 ? 32 : vw >= 640 ? 24 : 16);
      } else {
        setPaddingLeft((vw - maxW) / 2 + 32);
      }
    };

    updatePadding();
    window.addEventListener('resize', updatePadding);
    return () => window.removeEventListener('resize', updatePadding);
  }, []);

  // GSAP ScrollTrigger horizontal scrub: moves track sideways as page scrolls vertically
  // (hover:hover) + (pointer:fine) + no reduced motion, NO pinning, transform only
  useEffect(() => {
    if (typeof window === 'undefined' || !shouldRender) return;

    let mmRef: { revert: () => void } | null = null;
    let resizeTimer: number;

    const initScrollTrigger = async () => {
      try {

        const { gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        gsap.registerPlugin(ScrollTrigger);

        const mm = gsap.matchMedia();

        // Desktop fine pointer with motion allowed: sticky horizontal scrub
        mm.add(
          '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
          () => {
            const track = trackRef.current;
            const section = sectionRef.current;
            const stickyContainer = stickyContainerRef.current;
            if (!track || !section || !stickyContainer) return;

            // Distance formula per spec: track.scrollWidth - viewportWidth + rightPadding
            const getDistance = () => {
              const total = track.scrollWidth;
              const vw = window.innerWidth;
              const pad = paddingLeft;
              return Math.max(0, total - vw + pad);
            };

            const updateDimensions = () => {
              const dist = getDistance();
              const containerH = stickyContainer.offsetHeight;
              setSectionHeight(`${Math.round(containerH + dist)}px`);
              return dist;
            };

            updateDimensions();
            gsap.set(track, { x: 0 });

            gsap.fromTo(
              track,
              { x: 0 },
              {
                x: () => -getDistance(),
                ease: 'none',
                scrollTrigger: {
                  trigger: section,
                  start: 'top 64px',
                  end: () => `+=${getDistance()}`,
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              }
            );

            // Refresh after images finish loading
            const images = track.querySelectorAll('img');
            images.forEach((img) => {
              if (!img.complete) {
                img.addEventListener(
                  'load',
                  () => {
                    updateDimensions();
                    ScrollTrigger.refresh();
                  },
                  { once: true }
                );
              }
            });

            // Refresh after document fonts are loaded
            if (typeof document !== 'undefined' && document.fonts?.ready) {
              document.fonts.ready.then(() => {
                updateDimensions();
                ScrollTrigger.refresh();
              });
            }

            // Settle DOM measurements
            requestAnimationFrame(() => {
              updateDimensions();
              ScrollTrigger.refresh();
            });

            return () => {
              setSectionHeight('auto');
              gsap.set(track, { clearProps: 'transform' });
            };
          }
        );

        // Fallback for mobile, touch, and reduced-motion: native scroll-snap, auto height
        mm.add(
          '(max-width: 1023px), (hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)',
          () => {
            setSectionHeight('auto');
            const track = trackRef.current;
            if (track) {
              gsap.set(track, { clearProps: 'transform' });
            }
          }
        );

        mmRef = mm;
      } catch (err) {
        console.warn('GSAP ScrollTrigger horizontal scroll enhancement skipped:', err);
      }
    };

    // Initialize strictly after window load + idle
    const cancelIdle = runAfterLoadAndIdle(initScrollTrigger);

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(async () => {
        try {
          const { ScrollTrigger } = await import('gsap/ScrollTrigger');
          ScrollTrigger.refresh();
        } catch {
          // Ignore
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      cancelIdle();
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      mmRef?.revert();
    };
  }, [featuredEvents.length, shouldRender, paddingLeft]);

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

  const handleSkipFeatured = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const nextSection =
      (sectionRef.current?.nextElementSibling as HTMLElement) || document.getElementById('about');
    if (!nextSection) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = prefersReduced ? 'instant' : 'smooth';

    // Account for fixed floating navbar offset
    const navbarOffset = 80;
    const targetTop = nextSection.getBoundingClientRect().top + window.scrollY - navbarOffset;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: behavior as ScrollBehavior,
    });

    const heading = nextSection.querySelector('h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  };

  // Spec: Hide the section if fewer than 3 events
  if (!shouldRender) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      style={{ height: sectionHeight }}
      className="relative w-full bg-[#07060D]"
      aria-labelledby="featured-multiverse-heading"
    >
      {/* Sticky container during scrub scroll on desktop, relative on touch */}
      <div
        ref={stickyContainerRef}
        className="lg:sticky lg:top-16 w-full pt-8 pb-6 sm:pt-10 sm:pb-8 overflow-hidden flex flex-col justify-center"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#FF7A1A]/20 pb-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF7A1A] block mb-1">
                Curated Dimensions
              </span>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <h2
                  id="featured-multiverse-heading"
                  className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#F3EFE8]"
                >
                  ARTIFACTS OF THIS REALITY
                </h2>
                <a
                  href="#countdown"
                  onClick={handleSkipFeatured}
                  className="px-3 py-1.5 rounded-lg bg-[#0D1020] border border-white/10 text-xs font-semibold text-[#F3EFE8] hover:border-[#FF7A1A] hover:text-[#FF7A1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] inline-flex items-center"
                >
                  Skip featured
                </a>
              </div>
              <p className="text-sm sm:text-base text-[#B8B3C7] mt-1 font-medium">
                Extraordinary experiences are waiting to be discovered.
              </p>
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
                className="px-4 py-2 rounded-md bg-[#FF7A1A]/15 border border-[#FF7A1A]/60 text-xs font-bold uppercase tracking-wider text-[#FF7A1A] hover:bg-[#FF7A1A] hover:text-[#07060D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]"
              >
                VIEW ALL EVENTS
              </Link>
            </div>
          </div>
        </div>

        {/* Single Horizontal Full-Bleed Track:
            Left-aligned (starts at x=0 with paddingLeft equal to page container padding)
            Native overflow-x scroll-snap track fallback for touch / reduced-motion */}
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
            id="featured-multiverse-track"
            style={{
              paddingLeft: `${paddingLeft}px`,
              paddingRight: `${paddingLeft}px`,
            }}
            className="flex gap-6 items-stretch w-max will-change-transform justify-start"
          >
            {featuredEvents.map((event) => (
              <div
                key={event.id}
                onFocus={handleCardFocus}
                className="w-[280px] sm:w-[320px] md:w-[350px] shrink-0 snap-start flex flex-col"
              >
                <EventCard
                  event={event}
                  priority={false}
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
