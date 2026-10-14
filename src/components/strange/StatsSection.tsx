import { useEffect, useRef, useState, useMemo, type FC } from 'react';
import { FESTIVAL_CONFIG } from '../../config/festival';
import type { EventSummary } from '../../lib/types';

export interface StatsSectionProps {
  events: EventSummary[];
  totalPrizePool?: number | null; // From loaded detail data cache only
}

/**
 * Animated Festival Counters
 * Adheres strictly to Non-Negotiable Constraint 3:
 * - events count = real list length (live from API)
 * - total prize pool = sum of prizes ONLY from events already loaded in cache; hidden if unset/0
 * - participants/colleges = ONLY from festival.ts, else hidden
 * - animated once when in view using GSAP
 * - under prefers-reduced-motion, displays static target numbers immediately
 */
export const StatsSection: FC<StatsSectionProps> = ({ events, totalPrizePool }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize hasAnimated to true if prefers-reduced-motion is active
  const [hasAnimated, setHasAnimated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Active items derived strictly per Constraint 3:
  const items = useMemo(() => {
    const list: { id: string; label: string; value: number; prefix?: string; suffix?: string; isConfigured?: boolean }[] = [];

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

    // 2. Total Prize Pool (strictly from loaded/cached detail data)
    if (totalPrizePool && totalPrizePool > 0) {
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
        isConfigured: true, // Configured value in festival.ts
      });
    }

    // 4. Participating Colleges (from festival.ts only; hidden if unset)
    if (FESTIVAL_CONFIG.participatingColleges && FESTIVAL_CONFIG.participatingColleges > 0) {
      list.push({
        id: 'colleges',
        label: 'Participating Institutions',
        value: FESTIVAL_CONFIG.participatingColleges,
        suffix: '+',
        isConfigured: true, // Configured value in festival.ts
      });
    }

    return list;
  }, [events.length, totalPrizePool]);

  useEffect(() => {
    if (typeof window === 'undefined' || hasAnimated || items.length === 0) return;

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();

          try {
            const { gsap } = await import('gsap');
            items.forEach((item) => {
              const counterEl = document.getElementById(`stat-counter-${item.id}`);
              if (!counterEl) return;

              const target = item.value;
              const counter = { val: 0 };

              gsap.to(counter, {
                val: target,
                duration: 1.6,
                ease: 'power2.out',
                onUpdate: () => {
                  counterEl.textContent = `${item.prefix || ''}${Math.round(counter.val).toLocaleString('en-IN')}${item.suffix || ''}`;
                },
              });
            });
          } catch (err) {
            console.warn('GSAP counter error:', err);
          }
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated, items]);

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
        <div className={`grid grid-cols-2 md:grid-cols-${Math.min(items.length, 4)} gap-6 sm:gap-8 divide-x divide-white/5`}>
          {items.map((item) => (
            <div key={item.id} className="flex flex-col items-center text-center px-4 space-y-1">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
