import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type FC,
  type ReactNode,
  type KeyboardEvent,
} from 'react';
import { EventCard, EventCardSkeleton } from './EventCard';
import type { EventSummary } from '../../lib/types';

export interface RowProps {
  title: string;
  subtitle?: string;
  events?: (Partial<EventSummary> & { id: string })[];
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const Row: FC<RowProps> = ({
  title,
  subtitle,
  events,
  children,
  action,
  className = '',
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();

    const el = trackRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => checkScroll());
      resizeObserver.observe(el);
    }

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      resizeObserver?.disconnect();
    };
  }, [checkScroll, events]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== trackRef.current) return;
    if (e.key === 'ArrowLeft') {
      handleScroll('left');
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      handleScroll('right');
      e.preventDefault();
    }
  };

  return (
    <section className={`relative space-y-3 ${className}`} aria-labelledby={`row-heading-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      {/* Row Header */}
      <div className="flex items-end justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <h2
            id={`row-heading-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className="text-xl sm:text-2xl font-display font-normal tracking-wide text-white uppercase"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#b3b3b3] mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      {/* Row Track Container with Navigation Buttons */}
      <div className="relative group/row">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          disabled={!canScrollLeft}
          tabIndex={canScrollLeft ? 0 : -1}
          aria-hidden={!canScrollLeft}
          aria-label={`Scroll ${title} left`}
          className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center border border-white/10 shadow-2xl backdrop-blur-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914] ${
            canScrollLeft
              ? 'opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Scroll-Snap Track */}
        <div
          ref={trackRef}
          tabIndex={0}
          role="region"
          aria-label={`${title} events track. Use arrow keys or scroll buttons to navigate.`}
          onKeyDown={handleKeyDown}
          className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-3 px-4 sm:px-6 lg:px-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {events &&
            events.map((event) => (
              <div
                key={event.id}
                className="shrink-0 w-[260px] sm:w-[280px] md:w-[320px] snap-start"
              >
                <EventCard event={event} />
              </div>
            ))}
          {children}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          disabled={!canScrollRight}
          tabIndex={canScrollRight ? 0 : -1}
          aria-hidden={!canScrollRight}
          aria-label={`Scroll ${title} right`}
          className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center border border-white/10 shadow-2xl backdrop-blur-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914] ${
            canScrollRight
              ? 'opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export interface RowSkeletonProps {
  title?: string;
  count?: number;
  className?: string;
}

export const RowSkeleton: FC<RowSkeletonProps> = ({
  title,
  count = 5,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`} aria-hidden="true">
      {/* Heading Skeleton */}
      <div className="px-4 sm:px-6 lg:px-8 space-y-1.5">
        {title ? (
          <h2 className="text-xl sm:text-2xl font-display font-normal tracking-wide text-white/50 uppercase">
            {title}
          </h2>
        ) : (
          <div className="h-6 w-48 bg-[#222222] rounded-[4px] animate-pulse motion-reduce:animate-none" />
        )}
        <div className="h-3.5 w-72 bg-[#222222] rounded-[4px] animate-pulse motion-reduce:animate-none" />
      </div>

      {/* Cards Track Skeleton */}
      <div className="flex gap-4 md:gap-6 overflow-hidden py-3 px-4 sm:px-6 lg:px-8">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-[260px] sm:w-[280px] md:w-[320px]"
          >
            <EventCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
};
