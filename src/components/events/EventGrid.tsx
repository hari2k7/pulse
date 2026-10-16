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
}

/**
 * Shared EventGrid — identical container, columns, gap, and card for
 * /events (grid view) AND /favorites. No compact variant.
 *
 * Grid columns (P3):
 * - Below 640px  : 1 column (mobile unchanged)
 * - 640px+       : repeat(auto-fill, minmax(340px, 1fr)) — 2 cols @ 768, 3 @ 1280+
 * - Max-width    : 1440px (applied by page container)
 * - Gap          : 24px (sm+)
 *
 * Animation: GSAP ScrollTrigger.batch on unrevealed cards, tracks revealed IDs
 * in an internal ref. Never re-hides already-revealed cards. Resets when batchKey
 * changes (filter/search/sort change). New cards from "Show more" animate-in only.
 */
export const EventGrid: FC<EventGridProps> = ({
  events,
  priorityCount = 2,
  batchKey = '',
  className = '',
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const budget = useEffectsBudget();

  // Track which card IDs have been revealed — never re-hide them
  const revealedRef = useRef<Set<string>>(new Set());
  // Track the last batchKey seen to detect filter changes
  const lastBatchKeyRef = useRef<string>(batchKey);

  // When batchKey changes, reset revealed tracking so next render re-animates
  useEffect(() => {
    if (batchKey !== lastBatchKeyRef.current) {
      lastBatchKeyRef.current = batchKey;
      revealedRef.current = new Set();
    }
  }, [batchKey]);

  useEffect(() => {
    if (budget === 'lite') return;

    let ctx: { revert: () => void } | undefined;
    let active = true;

    const initBatch = async () => {
      try {
        const { gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        gsap.registerPlugin(ScrollTrigger);

        if (!active || !gridRef.current) return;

        ctx = gsap.context(() => {
          const mm = gsap.matchMedia();
          mm.add('(prefers-reduced-motion: no-preference)', () => {
            // Only animate cards not yet revealed
            const allCards = gridRef.current?.querySelectorAll<HTMLElement>('.ev-grid-card');
            if (!allCards || allCards.length === 0) return;

            const unrevealed: HTMLElement[] = [];
            allCards.forEach((el) => {
              const id = el.getAttribute('data-ev-id') ?? '';
              if (!revealedRef.current.has(id)) {
                unrevealed.push(el);
              }
            });

            if (unrevealed.length === 0) return;

            // Mark as revealed immediately so resize/re-renders don't re-hide them
            unrevealed.forEach((el) => {
              const id = el.getAttribute('data-ev-id') ?? '';
              if (id) revealedRef.current.add(id);
            });

            gsap.set(unrevealed, { opacity: 0, y: 24 });

            ScrollTrigger.batch(unrevealed, {
              start: 'top 90%',
              once: true,
              onEnter: (batch) => {
                gsap.to(batch, {
                  opacity: 1,
                  y: 0,
                  stagger: 0.07,
                  duration: 0.46,
                  ease: 'power2.out',
                  overwrite: 'auto',
                });
              },
            });

            ScrollTrigger.refresh();
          });
        }, gridRef);
      } catch {
        // No GSAP — cards just appear
      }
    };

    const timer = setTimeout(initBatch, 30);
    return () => {
      active = false;
      clearTimeout(timer);
      ctx?.revert();
    };
  // Re-run when events count changes (Show More added new cards) or batchKey reset
  }, [budget, events.length, batchKey]);

  return (
    <div
      ref={gridRef}
      className={`event-grid-root grid items-stretch ${className}`}
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

/** Loading skeleton matching EventGrid column layout (P3) */
export const EventGridSkeleton: FC<{ count?: number; className?: string }> = ({
  count = 8,
  className = '',
}) => (
  <div className={`event-grid-root grid items-stretch ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="h-full">
        <EventCardSkeleton className="h-full animate-pulse" />
      </div>
    ))}
  </div>
);
