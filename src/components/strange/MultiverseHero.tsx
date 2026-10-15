import { useEffect, useRef, useState, useCallback, type FC } from 'react';
import { Link } from 'react-router-dom';
import { SlingRingPortal } from './SlingRingPortal';
import { SectionErrorBoundary } from '../common/SectionErrorBoundary';
import { FESTIVAL_CONFIG } from '../../config/festival';
import { runAfterLoadAndIdle } from '../../lib/idle';
import { useEffectsBudget } from '../../hooks/useEffectsBudget';

export const MultiverseHero: FC = () => {
  const budget = useEffectsBudget();
  const isLite = budget === 'lite';

  const heroRef = useRef<HTMLDivElement>(null);
  const portalWrapperRef = useRef<HTMLDivElement>(null);
  const portalRingRef = useRef<SVGGElement>(null);
  const chamberRef = useRef<HTMLDivElement>(null);
  const textGroupRef = useRef<HTMLDivElement>(null);

  // Intro Sequence Phases: 'done' by default (SSR/immediate), or animated on first visit
  const [introPhase, setIntroPhase] = useState<'dark' | 'tracing' | 'igniting' | 'opening' | 'done'>('done');
  const [isIntroActive, setIsIntroActive] = useState(false);

  // Skip Intro handler
  const skipIntro = useCallback(() => {
    try {
      sessionStorage.setItem('strange_hero_intro_played', 'true');
    } catch {
      // Ignore storage errors in private browsing
    }
    setIntroPhase('done');
    setIsIntroActive(false);
  }, []);

  // Intro Sequence Orchestration: 2 to 3 seconds total, first visit of session only
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if intro should be skipped
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isPopNav =
      window.performance?.getEntriesByType?.('navigation')?.[0] &&
      (window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).type === 'back_forward';

    const alreadyPlayed = (() => {
      try {
        return sessionStorage.getItem('strange_hero_intro_played') === 'true';
      } catch {
        return false;
      }
    })();

    if (alreadyPlayed || isReducedMotion || isLite || isPopNav) {
      return;
    }

    // Begin first-visit session intro sequence asynchronously
    const t0 = setTimeout(() => {
      setIsIntroActive(true);
      setIntroPhase('dark');
    }, 0);

    const t1 = setTimeout(() => setIntroPhase('tracing'), 350);
    const t2 = setTimeout(() => setIntroPhase('igniting'), 1000);
    const t3 = setTimeout(() => setIntroPhase('opening'), 1700);
    const t4 = setTimeout(() => {
      skipIntro();
    }, 2800);

    // Escape key or any click on the hero skips intro immediately
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipIntro();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLite, skipIntro]);

  // Scene 2 (Scroll): GSAP ScrollTrigger scrub - text and button enter portal, ring contracts and collapses to point
  useEffect(() => {
    if (typeof window === 'undefined' || isLite) return;

    let ctx: gsap.Context | null = null;

    const initScrollTrigger = async () => {
      try {
        const { gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          const mm = gsap.matchMedia();

          mm.add('(prefers-reduced-motion: no-preference)', () => {
            const hero = heroRef.current;
            const portal = portalWrapperRef.current;
            const ring = portalRingRef.current;
            const chamber = chamberRef.current;
            const textGroup = textGroupRef.current;

            if (!hero || !portal || !textGroup) return;

            const isMobile = window.innerWidth < 768;
            const ctaLink = textGroup.querySelector<HTMLAnchorElement>('a');

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: isMobile ? 'bottom 20%' : 'bottom top',
                scrub: 0.5,
                onUpdate: (self) => {
                  // Content shrinks below ~50% scale at ~20% scroll progress (0-40% scale tween)
                  const isShrunkBelowHalf = self.progress >= 0.2;
                  if (isShrunkBelowHalf) {
                    textGroup.style.pointerEvents = 'none';
                    if (ctaLink) ctaLink.setAttribute('tabindex', '-1');
                  } else {
                    textGroup.style.pointerEvents = 'auto';
                    if (ctaLink) ctaLink.removeAttribute('tabindex');
                  }
                },
              },
            });

            // 1. Sequence 0% - 40%: Headline, tagline, copy, and button travel INTO the portal
            // Scaling down toward portal center, losing opacity at the very end of this phase
            tl.to(
              textGroup,
              {
                scale: 0.04,
                duration: 0.4,
                ease: 'power2.in',
                transformOrigin: 'center center',
              },
              0
            );
            tl.to(
              textGroup,
              {
                opacity: 0,
                duration: 0.12,
                ease: 'power1.in',
              },
              0.28
            );

            // 2. Sequence 40% - 75%: Ring contracts, sparks peel, inner world recedes
            if (ring) {
              tl.to(
                ring,
                {
                  scale: 0.45,
                  opacity: 0.85,
                  duration: 0.35,
                  ease: 'power2.in',
                  transformOrigin: 'center center',
                },
                0.4
              );
            }
            if (chamber) {
              tl.to(
                chamber,
                {
                  scale: 0.3,
                  opacity: 0.25,
                  duration: 0.35,
                  ease: 'power2.in',
                  transformOrigin: 'center center',
                },
                0.4
              );
            }
            tl.to(
              portal,
              {
                scale: 0.65,
                duration: 0.35,
                ease: 'power2.in',
                transformOrigin: 'center center',
              },
              0.4
            );

            // 3. Sequence 75% - 100%: Portal collapses to a small bright point and vanishes
            tl.to(
              portal,
              {
                scale: 0.02,
                opacity: 0,
                duration: 0.25,
                ease: 'power3.in',
                transformOrigin: 'center center',
              },
              0.75
            );
            if (ring) {
              tl.to(
                ring,
                {
                  scale: 0.05,
                  opacity: 0,
                  duration: 0.25,
                  ease: 'power3.in',
                  transformOrigin: 'center center',
                },
                0.75
              );
            }
            if (chamber) {
              tl.to(
                chamber,
                {
                  scale: 0.05,
                  opacity: 0,
                  duration: 0.25,
                  ease: 'power3.in',
                  transformOrigin: 'center center',
                },
                0.75
              );
            }
          });
        }, heroRef);
      } catch (err) {
        console.warn('Hero GSAP scroll scrub skipped:', err);
      }
    };

    const cancelIdle = runAfterLoadAndIdle(initScrollTrigger, 1000);

    return () => {
      cancelIdle();
      ctx?.revert();
    };
  }, [isLite]);

  return (
    <section
      ref={heroRef}
      onClick={isIntroActive ? skipIntro : undefined}
      className="relative w-full min-h-[92vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-[#07060D] pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 select-none"
      id="festival-hero"
      aria-label="Festival Hero"
    >
      {/* Visible Skip Intro Button (Only shown during active intro) */}
      {isIntroActive && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            skipIntro();
          }}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-40 px-3 py-1.5 rounded-md bg-[#07060D]/90 border border-[#F5B642]/60 text-[#F5B642] text-xs font-mono font-semibold tracking-wider hover:bg-[#F5B642]/20 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]"
          aria-label="Skip introductory portal animation"
        >
          Skip intro [Esc]
        </button>
      )}

      {/* Intro Camera Push Wrapper (transform only, no layout shift) */}
      <div
        className={`relative w-full h-full flex items-center justify-center transition-transform duration-1000 ease-out ${
          introPhase === 'opening' ? 'scale-105' : 'scale-100'
        }`}
      >
        {/* Layer 1: Dominant Sling Ring Portal (Behind Headline Text) */}
        <SectionErrorBoundary sectionName="hero-portal">
          <div
            ref={portalWrapperRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"
            aria-hidden="true"
          >
            <SlingRingPortal
              size={580}
              introPhase={introPhase === 'dark' ? 'tracing' : introPhase}
              ringRef={portalRingRef}
              chamberRef={chamberRef}
            />
          </div>
        </SectionErrorBoundary>

        {/* Layer 2: Foreground Content (Always real text visible in first paint for LCP) */}
        <div
          ref={textGroupRef}
          className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center space-y-6 pt-4"
        >
          {/* Real H1 Title (LCP Element) */}
          <div className="relative inline-block">
            <h1 className="font-display font-bold text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.14em] text-[#F3EFE8] leading-none drop-shadow-2xl">
              STR<span className="text-[#FF7A1A]">A</span>NGE
            </h1>
            {/* Intro light-sweep highlight */}
            {introPhase === 'opening' && (
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFE5A3]/40 to-transparent pointer-events-none animate-shimmer"
                aria-hidden="true"
              />
            )}
          </div>

          {/* Tagline */}
          <p className="font-display text-lg sm:text-2xl md:text-3xl tracking-[0.22em] uppercase text-[#F5B642] max-w-2xl font-semibold drop-shadow-lg">
            {FESTIVAL_CONFIG.tagline || 'A Tech Fest Beyond Reality.'}
          </p>

          {/* Honest Festival Logistics (From festival.ts, unset = hidden) */}
          {(FESTIVAL_CONFIG.startDate || FESTIVAL_CONFIG.venue) && (
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-[#B8B3C7] font-medium pt-1">
              {FESTIVAL_CONFIG.startDate && (
                <span className="px-3.5 py-1.5 rounded-md bg-[#0D1020]/80 border border-[#F5B642]/30 shadow-sm">
                  {new Date(FESTIVAL_CONFIG.startDate).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {FESTIVAL_CONFIG.endDate
                    ? ` – ${new Date(FESTIVAL_CONFIG.endDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}`
                    : ''}
                </span>
              )}
              {FESTIVAL_CONFIG.venue && (
                <span className="px-3.5 py-1.5 rounded-md bg-[#0D1020]/80 border border-[#F5B642]/30 shadow-sm">
                  {FESTIVAL_CONFIG.venue}
                </span>
              )}
            </div>
          )}

          {/* Editorial Sub-copy */}
          <p className="text-sm sm:text-base md:text-lg text-[#B8B3C7] max-w-xl leading-relaxed">
            Traverse 30+ dimensional hackathons, workshops, and technical crucibles.
            Step through the Sling Ring and push the boundaries of engineering.
          </p>

          {/* Primary CTA (Opacity-only transition in intro, never layout shift) */}
          <div
            className={`pt-2 transition-opacity duration-700 ${
              introPhase === 'dark' || introPhase === 'tracing' ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <Link
              to="/events"
              className="inline-flex items-center justify-center font-bold text-sm sm:text-base uppercase tracking-wider px-8 py-3.5 rounded-md bg-[#FF7A1A] text-[#07060D] hover:bg-[#F5B642] transition-colors active:scale-95 shadow-[0_0_24px_rgba(255,122,26,0.5)] border border-[#FFE082]"
            >
              Explore Events
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
