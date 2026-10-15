import { useEffect, useRef, useState, useMemo, type FC } from 'react';
import { FESTIVAL_CONFIG } from '../../config/festival';
import type { EventSummary } from '../../lib/types';
import type { UsePrizePoolResult } from '../../hooks/usePrizePool';

export interface StatsSectionProps {
  events: EventSummary[];
  totalPrizePool?: number | null;
  prizePool?: UsePrizePoolResult;
}

interface StatItem {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  isSkeleton?: boolean;
  isConfigured?: boolean;
}

/**
 * Animated Festival Counters
 * Adheres strictly to Non-Negotiable Constraint 3:
 * - events count = real list length (live from API)
 * - total prize pool = sum of prizes ONLY from events where event_status === 'ACTIVE';
 *   counter slot is always reserved during computing to prevent layout shift;
 *   persisted in localStorage and updated silently on completion.
 * - participants/colleges = ONLY from festival.ts, else hidden
 * - animated once when in view using GSAP
 * - under prefers-reduced-motion, displays static target numbers immediately
 */
export const StatsSection: FC<StatsSectionProps> = ({ events, totalPrizePool, prizePool }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedMapRef = useRef<Set<string>>(new Set());
  const isInViewRef = useRef(false);

  // Check prefers-reduced-motion
  const [prefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Active items derived strictly per Constraint 3:
  const items = useMemo(() => {
    const list: StatItem[] = [];

    // 1. Live Events Count from API
    if (events.length > 0) {
      list.push({
        id: 'events-count',
        label: 'Realms & Events',
        value: events.length,
        suffix: '+',
        isConfigured: false,
      });
    }

    // 2. Discovered Prize Pool (from usePrizePool hook or legacy fallback)
    if (prizePool) {
      if (prizePool.isLoading) {
        // Slot is reserved while computing with no persisted value to avoid layout shift
        list.push({
          id: 'prize-pool',
          label: 'Discovered Prize Pool',
          value: 0,
          isSkeleton: true,
        });
      } else if (prizePool.total !== null && prizePool.total > 0) {
        list.push({
          id: 'prize-pool',
          label: 'Discovered Prize Pool',
          value: prizePool.total,
          prefix: '₹',
          suffix: prizePool.isPartial ? '+' : '',
          isSkeleton: false,
        });
      }
    } else if (totalPrizePool && totalPrizePool > 0) {
      list.push({
        id: 'prize-pool',
        label: 'Discovered Prize Pool',
        value: totalPrizePool,
        prefix: '₹',
        isConfigured: false,
      });
    }

    // 3. Expected Participants (from festival.ts only; hidden if unset)
    if (FESTIVAL_CONFIG.expectedParticipants && FESTIVAL_CONFIG.expectedParticipants > 0) {
      list.push({
        id: 'participants',
        label: 'Expected Explorers',
        value: FESTIVAL_CONFIG.expectedParticipants,
        suffix: '+',
        isConfigured: true,
      });
    }

    // 4. Participating Colleges (from festival.ts only; hidden if unset)
    if (FESTIVAL_CONFIG.participatingColleges && FESTIVAL_CONFIG.participatingColleges > 0) {
      list.push({
        id: 'colleges',
        label: 'Participating Institutions',
        value: FESTIVAL_CONFIG.participatingColleges,
        suffix: '+',
        isConfigured: true,
      });
    }

    return list;
  }, [events.length, totalPrizePool, prizePool]);

  // Handle in-view intersection and GSAP count-up
  useEffect(() => {
    if (typeof window === 'undefined' || items.length === 0) return;

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const runItemAnimation = async (item: StatItem) => {
      const counterEl = document.getElementById(`stat-counter-${item.id}`);
      if (!counterEl) return;

      const formatted = `${item.prefix || ''}${item.value.toLocaleString('en-IN')}${item.suffix || ''}`;

      if (prefersReducedMotion) {
        counterEl.textContent = formatted;
        animatedMapRef.current.add(item.id);
        return;
      }

      // If already animated once, set the updated value directly without re-animating
      if (animatedMapRef.current.has(item.id)) {
        counterEl.textContent = formatted;
        return;
      }

      animatedMapRef.current.add(item.id);
      try {
        const { gsap } = await import('gsap');
        const counter = { val: 0 };
        gsap.to(counter, {
          val: item.value,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => {
            counterEl.textContent = `${item.prefix || ''}${Math.round(counter.val).toLocaleString('en-IN')}${item.suffix || ''}`;
          },
        });
      } catch {
        counterEl.textContent = formatted;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          isInViewRef.current = true;
          items.forEach((item) => {
            if (!item.isSkeleton && item.value > 0) {
              runItemAnimation(item);
            }
          });
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    // If already in view when items change/update (e.g. background fetch completes)
    if (isInViewRef.current) {
      items.forEach((item) => {
        if (!item.isSkeleton && item.value > 0) {
          runItemAnimation(item);
        }
      });
    }

    return () => observer.disconnect();
  }, [items, prefersReducedMotion]);

  // If no stats qualify, hide entire section
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      ref={containerRef}
      className="relative w-full py-12 sm:py-16 bg-[#07060D] border-y border-[#FF7A1A]/20"
      aria-label="Festival Statistics"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-2 md:grid-cols-${Math.min(
            items.length,
            4
          )} gap-6 sm:gap-8 divide-x divide-white/5`}
        >
          {items.map((item) => (
            <div key={item.id} className="flex flex-col items-center text-center px-4 space-y-1">
              {item.isSkeleton ? (
                /* Reserved skeleton slot while computing with no persisted value */
                <div className="flex flex-col items-center space-y-2 py-1">
                  <div className="h-9 sm:h-12 md:h-14 w-32 sm:w-44 rounded-lg bg-white/10 animate-pulse" />
                  <span className="text-xs sm:text-sm uppercase tracking-widest text-[#B8B3C7] font-medium pt-1">
                    {item.label}
                  </span>
                </div>
              ) : (
                <>
                  <span
                    id={`stat-counter-${item.id}`}
                    className="font-display font-bold text-3xl sm:text-5xl md:text-6xl text-[#F3EFE8] tracking-tight leading-none"
                  >
                    {/* Fallback before JS or during reduced motion */}
                    {`${item.prefix || ''}${item.value.toLocaleString('en-IN')}${item.suffix || ''}`}
                  </span>
                  <span className="text-xs sm:text-sm uppercase tracking-widest text-[#B8B3C7] font-medium pt-1">
                    {item.label}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
