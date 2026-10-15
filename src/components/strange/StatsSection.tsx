import { useEffect, useRef, useState, useMemo, type FC } from 'react';
import { FESTIVAL_CONFIG } from '../../config/festival';
import type { EventSummary } from '../../lib/types';
import type { UsePrizePoolResult } from '../../hooks/usePrizePool';
import { useEffectsBudget } from '../../hooks/useEffectsBudget';
import { SectionErrorBoundary } from '../common/SectionErrorBoundary';

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
}

/**
 * Scene 5B: Animated Festival Stats & Red Cloak Fabric Divider Strip
 * Placed immediately after the Eye of Agamotto countdown and before About.
 * - Counters: GSAP count-up once when in view, final numbers immediately under reduced motion/lite.
 * - Reserved space (no layout shift), values strictly from live list and usePrizePool.
 * - Red cloak strip below sweeps in once on scroll (clip-path, ~700ms) and stays static.
 */
export const StatsSection: FC<StatsSectionProps> = ({ events, totalPrizePool, prizePool }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const redStripRef = useRef<HTMLDivElement>(null);
  const animatedMapRef = useRef<Set<string>>(new Set());
  const isInViewRef = useRef(false);

  const budget = useEffectsBudget();
  const isLite = budget === 'lite';

  // Check prefers-reduced-motion
  const [prefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Active items derived strictly from live API and configured values
  const items = useMemo(() => {
    const list: StatItem[] = [];

    // 1. Live Events Count from API
    if (events.length > 0) {
      list.push({
        id: 'events-count',
        label: 'Realms & Events',
        value: events.length,
        suffix: '+',
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
      });
    }

    // 3. Expected Participants (from festival.ts only; hidden if unset)
    if (FESTIVAL_CONFIG.expectedParticipants && FESTIVAL_CONFIG.expectedParticipants > 0) {
      list.push({
        id: 'participants',
        label: 'Expected Explorers',
        value: FESTIVAL_CONFIG.expectedParticipants,
        suffix: '+',
      });
    }

    // 4. Participating Colleges (from festival.ts only; hidden if unset)
    if (FESTIVAL_CONFIG.participatingColleges && FESTIVAL_CONFIG.participatingColleges > 0) {
      list.push({
        id: 'colleges',
        label: 'Participating Institutions',
        value: FESTIVAL_CONFIG.participatingColleges,
        suffix: '+',
      });
    }

    return list;
  }, [events.length, totalPrizePool, prizePool]);

  // Handle in-view intersection and GSAP count-up once
  useEffect(() => {
    if (typeof window === 'undefined' || items.length === 0) return;

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const runItemAnimation = async (item: StatItem) => {
      const counterEl = document.getElementById(`stat-counter-${item.id}`);
      if (!counterEl) return;

      const formatted = `${item.prefix || ''}${item.value.toLocaleString('en-IN')}${item.suffix || ''}`;

      if (prefersReducedMotion || isLite) {
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
          duration: 1.4,
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
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
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
  }, [items, prefersReducedMotion, isLite]);

  // Red cloak fabric divider sweep animation (sweeps in once on scroll over ~700ms, then stays static)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stripEl = redStripRef.current;
    if (!stripEl) return;

    if (prefersReducedMotion || isLite) {
      stripEl.style.clipPath = 'inset(0 0 0 0)';
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          stripEl.style.transition = 'clip-path 700ms cubic-bezier(0.16, 1, 0.3, 1)';
          stripEl.style.clipPath = 'inset(0 0 0 0)';
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(stripEl);
    return () => observer.disconnect();
  }, [prefersReducedMotion, isLite]);

  // If no stats qualify, hide entire section
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      id="festival-stats"
      ref={containerRef}
      className="relative w-full bg-[#07060D] pt-12 sm:pt-16 overflow-hidden"
      aria-label="Festival Statistics"
    >
      {/* Counters Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
        <div
          className={`grid grid-cols-2 md:grid-cols-${Math.min(
            items.length,
            4
          )} gap-6 sm:gap-8 divide-x divide-white/10`}
        >
          {items.map((item) => (
            <SectionErrorBoundary key={item.id} sectionName={item.id === 'prize-pool' ? 'prize-pool' : `stat-${item.id}`}>
              <div className="flex flex-col items-center text-center px-4 space-y-1.5 min-h-[5.5rem] justify-center">
                {item.isSkeleton ? (
                  /* Reserved skeleton slot while computing with no persisted value */
                  <div className="flex flex-col items-center space-y-2 py-1">
                    <div className="h-9 sm:h-12 md:h-14 w-32 sm:w-44 rounded-lg bg-white/10 animate-pulse" />
                    <span className="text-xs sm:text-sm uppercase tracking-widest text-[#B8B3C7] font-mono pt-1">
                      {item.label}
                    </span>
                  </div>
                ) : (
                  <>
                    <span
                      id={`stat-counter-${item.id}`}
                      className="font-display font-bold text-3xl sm:text-5xl md:text-6xl text-[#F3EFE8] tracking-tight leading-none bg-gradient-to-b from-[#FFF8E7] to-[#FFE082] bg-clip-text text-transparent drop-shadow-md"
                    >
                      {/* Fallback before JS or during reduced motion */}
                      {`${item.prefix || ''}${item.value.toLocaleString('en-IN')}${item.suffix || ''}`}
                    </span>
                    <span className="text-xs sm:text-sm uppercase tracking-widest text-[#B8B3C7] font-mono font-medium pt-1">
                      {item.label}
                    </span>
                  </>
                )}
              </div>
            </SectionErrorBoundary>
          ))}
        </div>
      </div>

      {/* Red Cloak-Fabric Divider Strip (Restored from CloakSilhouette variant="divider")
          Sweeps in once on scroll (clip-path, ~700ms) and stays static */}
      <div
        ref={redStripRef}
        style={{
          clipPath: prefersReducedMotion || isLite ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
        }}
        className="w-full overflow-hidden leading-none select-none pointer-events-none"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-12 sm:h-16 md:h-20"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C320,90 640,110 960,60 C1200,20 1360,80 1440,100 L1440,120 L0,120 Z"
            fill="url(#cloak-divider-grad)"
          />
          {/* Subtle gold embroidered trim along the top curve */}
          <path
            d="M0,0 C320,90 640,110 960,60 C1200,20 1360,80 1440,100"
            stroke="#F5B642"
            strokeWidth="1.5"
            strokeOpacity="0.45"
            fill="none"
          />
          <path
            d="M0,40 C360,110 720,80 1080,90 C1260,95 1380,50 1440,40 L1440,120 L0,120 Z"
            fill="#07060D"
            fillOpacity="0.8"
          />
          <defs>
            <linearGradient id="cloak-divider-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C8102E" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#800010" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#07060D" stopOpacity="0.95" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
};
