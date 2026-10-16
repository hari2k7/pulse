import { useRef, useEffect, type FC } from 'react';
import { EventCard, EventCardSkeleton } from './EventCard';
import { useEffectsBudget } from '../../hooks/useEffectsBudget';
import type { EventSummary } from '../../lib/types';

export interface EventGridProps {
  /** Events to display in this batch */
  events: (Partial<EventSummary> & { id: string })[];
  /** Priority loading for first N cards */
  priorityCount?: number;
  /**
   * Batch key — when this changes EventGrid resets internal revealed IDs
   * and re-runs the batch reveal animation for all cards.
   * Pass filterKey on /events so filter changes refresh animation state.
   */
  batchKey?: string;
  /** Extra classes on the grid root */
  className?: string;
  /** Grid variant: 'default' (/events unchanged) or 'favorites' (3-col desktop on /favorites) */
  variant?: 'default' | 'favorites';
}

/**
 * EventGrid — shared layout for /events and /favorites.
 * - /events (default): repeat(auto-fill, minmax(340px, 1fr)) via .event-grid-root
 * - /favorites: exactly 3 columns on desktop via .favorites-grid-root (Task 1)
 */
interface ScrollTriggerInstance {
  kill?: () => void;
}

export const EventGrid: FC<EventGridProps> = ({
  events,
  priorityCount = 2,
  batchKey = '',
  className = '',
  variant = 'default',
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const budget = useEffectsBudget();

  // Track which card IDs have been revealed — never re-hide them
  const revealedRef = useRef<Set<string>>(new Set());
  // Track the last batchKey seen to detect filter changes
  const lastBatchKeyRef = useRef<string>(batchKey);
  // Store all active ScrollTriggers to clean up ONLY on unmount or batchKey change
  const triggersRef = useRef<ScrollTriggerInstance[]>([]);

  // When batchKey changes (filter changed), clean up previous triggers and reset revealed tracking
  useEffect(() => {
    if (batchKey !== lastBatchKeyRef.current) {
      lastBatchKeyRef.current = batchKey;
      triggersRef.current.forEach((t) => t?.kill?.());
      triggersRef.current = [];
      revealedRef.current.clear();
    }
  }, [batchKey]);

  useEffect(() => {
    if (budget === 'lite') {
      events.forEach((e) => revealedRef.current.add(e.id));
      return;
    }

    let active = true;

    const initBatch = async () => {
      try {
        const { gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        gsap.registerPlugin(ScrollTrigger);

        if (!active || !gridRef.current) return;

        const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Find all card elements currently in the DOM
        const allCards = gridRef.current.querySelectorAll<HTMLElement>('.ev-grid-card');
        if (!allCards || allCards.length === 0) return;

        const unrevealed: HTMLElement[] = [];
        allCards.forEach((el) => {
          const id = el.getAttribute('data-ev-id') ?? '';
          if (!id || revealedRef.current.has(id)) {
            // Already revealed: leave untouched so style and scroll position stay preserved
            return;
          }
          unrevealed.push(el);
        });

        if (unrevealed.length === 0) {
          ScrollTrigger.refresh();
          return;
        }

        if (isReducedMotion) {
          unrevealed.forEach((el) => {
            const id = el.getAttribute('data-ev-id') ?? '';
            if (id) revealedRef.current.add(id);
            el.style.opacity = '1';
            el.style.transform = 'none';
          });
          ScrollTrigger.refresh();
          return;
        }

        // Animate unrevealed cards when they enter the viewport
        // Crucial: DO NOT pre-hide with gsap.set(opacity: 0)!
        // Using fromTo on enter ensures cards are never stuck at opacity 0 if scroll jumps
        const newTriggers = ScrollTrigger.batch(unrevealed, {
          start: 'top 95%',
          once: true,
          onEnter: (batch) => {
            batch.forEach((el) => {
              const id = el.getAttribute('data-ev-id');
              if (id) revealedRef.current.add(id);
            });
            gsap.fromTo(
              batch,
              { opacity: 0, y: 16 },
              {
                opacity: 1,
                y: 0,
                stagger: 0.05,
                duration: 0.38,
                ease: 'power2.out',
                clearProps: 'opacity,transform',
                overwrite: 'auto',
              }
            );
          },
          onEnterBack: (batch) => {
            batch.forEach((el) => {
              const id = el.getAttribute('data-ev-id');
              if (id) revealedRef.current.add(id);
            });
            gsap.fromTo(
              batch,
              { opacity: 0, y: 16 },
              {
                opacity: 1,
                y: 0,
                stagger: 0.05,
                duration: 0.38,
                ease: 'power2.out',
                clearProps: 'opacity,transform',
                overwrite: 'auto',
              }
            );
          },
        });

        if (Array.isArray(newTriggers)) {
          triggersRef.current.push(...newTriggers);
        }

        ScrollTrigger.refresh();
      } catch {
        // Fallback: all cards visible
        gridRef.current?.querySelectorAll<HTMLElement>('.ev-grid-card').forEach((el) => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      }
    };

    const timer = setTimeout(initBatch, 20);

    return () => {
      active = false;
      clearTimeout(timer);
      // NOTE: Do NOT call ctx?.revert() or kill existing triggers on re-render!
      // Existing cards must stay revealed and preserve their styles/nodes.
    };
  // Re-run ONLY when new cards are appended or batchKey changes
  }, [budget, events, batchKey]);

  // Cleanup on final unmount of EventGrid component
  useEffect(() => {
    return () => {
      triggersRef.current.forEach((t) => t?.kill?.());
      triggersRef.current = [];
    };
  }, []);

  const rootClass = variant === 'favorites' ? 'favorites-grid-root' : 'event-grid-root';

  return (
    <div
      ref={gridRef}
      className={`${rootClass} grid items-stretch ${className}`}
    >
      {events.map((event, idx) => (
        <div
          key={event.id}
          className="ev-grid-card h-full"
          data-ev-id={event.id}
        >
          <EventCard
            event={event}
            priority={idx < priorityCount}
            className="h-full"
          />
        </div>
      ))}
    </div>
  );
};

/** Loading skeleton matching EventGrid column layout */
export const EventGridSkeleton: FC<{
  count?: number;
  className?: string;
  variant?: 'default' | 'favorites';
}> = ({
  count = 8,
  className = '',
  variant = 'default',
}) => {
  const rootClass = variant === 'favorites' ? 'favorites-grid-root' : 'event-grid-root';
  return (
    <div className={`${rootClass} grid items-stretch ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-full">
          <EventCardSkeleton className="h-full animate-pulse" />
        </div>
      ))}
    </div>
  );
};
