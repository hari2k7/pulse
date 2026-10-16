import { useEffect, useRef, useMemo, useCallback, useState, type FC } from 'react';
import { Link } from 'react-router-dom';
import { SlingRingPortal } from './SlingRingPortal';
import { SectionErrorBoundary } from '../common/SectionErrorBoundary';
import { FESTIVAL_CONFIG } from '../../config/festival';
import { runAfterLoadAndIdle } from '../../lib/idle';
import { useEffectsBudget } from '../../hooks/useEffectsBudget';

const DUST_MOTES = [
  { top: '22%', left: '16%', dur: '6.5s', delay: '0s', size: 2 },
  { top: '38%', left: '82%', dur: '8.2s', delay: '1s', size: 2.4 },
  { top: '52%', left: '26%', dur: '7.1s', delay: '2s', size: 1.8 },
  { top: '64%', left: '72%', dur: '9.0s', delay: '0.5s', size: 2.2 },
  { top: '28%', left: '62%', dur: '6.8s', delay: '1.5s', size: 2 },
  { top: '76%', left: '32%', dur: '8.5s', delay: '2.5s', size: 2.2 },
  { top: '42%', left: '12%', dur: '7.6s', delay: '0.8s', size: 1.8 },
  { top: '56%', left: '86%', dur: '8.8s', delay: '1.2s', size: 2 },
  { top: '18%', left: '46%', dur: '6.2s', delay: '2.2s', size: 1.6 },
  { top: '82%', left: '54%', dur: '7.9s', delay: '0.3s', size: 2.2 },
  { top: '32%', left: '36%', dur: '8.1s', delay: '1.8s', size: 2 },
  { top: '68%', left: '20%', dur: '9.3s', delay: '1.1s', size: 1.8 },
];

export const MultiverseHero: FC = () => {
  const budget = useEffectsBudget();
  const isLite = budget === 'lite';

  // Refs for scroll animation targets
  const wrapperRef = useRef<HTMLDivElement>(null);   // tall scroll wrapper (ScrollTrigger trigger)
  const stickyRef = useRef<HTMLDivElement>(null);    // sticky 100svh child (visual hero)
  const portalWrapperRef = useRef<HTMLDivElement>(null);
  const portalRingRef = useRef<SVGGElement>(null);
  const chamberRef = useRef<HTMLDivElement>(null);
  const textGroupRef = useRef<HTMLDivElement>(null);
  const ctaLinkRef = useRef<HTMLAnchorElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  // "shockwave" element shown at phase 80-100%
  const shockwaveRef = useRef<HTMLDivElement>(null);
  const singularityRef = useRef<HTMLDivElement>(null);
  const exitVoidRef = useRef<HTMLDivElement>(null);

  // Parallax Layer Refs (Desktop non-lite only, tiny amplitude)
  const farLayerRef = useRef<HTMLDivElement>(null);
  const midLayerRef = useRef<HTMLDivElement>(null);
  const nearLayerRef = useRef<HTMLDivElement>(null);

  // Hero H1 and scroll state refs for P1 variable typography
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const isHeroScrolledRef = useRef(false);

  // Desktop non-lite mousemove subtle depth parallax (tiny amplitude, rAF throttled)
  useEffect(() => {
    if (typeof window === 'undefined' || isLite) return;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDesktop = window.innerWidth >= 1024;
    if (isReduced || !isDesktop) return;

    let rafId: number;
    let isVisible = true;

    const sticky = stickyRef.current;
    if (!sticky) return;

    const obs = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0.05 }
    );
    obs.observe(sticky);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) return;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = sticky.getBoundingClientRect();
        const xNorm = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const yNorm = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

        if (farLayerRef.current) {
          farLayerRef.current.style.transform = `translate(${xNorm * -4}px, ${yNorm * -3}px)`;
        }
        if (midLayerRef.current) {
          midLayerRef.current.style.transform = `translate(${xNorm * -8}px, ${yNorm * -6}px)`;
        }
        if (nearLayerRef.current) {
          nearLayerRef.current.style.transform = `translate(${xNorm * 10}px, ${yNorm * 7}px)`;
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      obs.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isLite]);

  // P1: Hero Text Cursor-Proximity Variable Typography (Cinzel Variable wght 400-900)
  useEffect(() => {
    if (typeof window === 'undefined' || isLite) return;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (isReduced || !hasFinePointer) return;

    let cleanup = () => {};

    const cancelIdle = runAfterLoadAndIdle(() => {
      const h1 = h1Ref.current;
      const sticky = stickyRef.current;
      if (!h1 || !sticky) return;

      const spans = Array.from(h1.querySelectorAll<HTMLSpanElement>('.hero-ch'));
      if (spans.length !== 7) return;

      // Lock advance width at max weight (900) to prevent layout shifts/CLS
      spans.forEach((span) => {
        span.style.fontVariationSettings = "'wght' 900";
      });
      const widths = spans.map((span) => {
        const rect = span.getBoundingClientRect();
        return Math.ceil(rect.width * 10) / 10;
      });
      spans.forEach((span, i) => {
        span.style.width = `${widths[i]}px`;
        span.style.fontVariationSettings = "'wght' 700";
      });

      // Cache bounding-box centers for all letters
      const centers: { x: number; y: number }[] = [];
      const updateCenters = () => {
        centers.length = 0;
        spans.forEach((span) => {
          const rect = span.getBoundingClientRect();
          centers.push({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          });
        });
      };
      updateCenters();

      let pointerX = -9999;
      let pointerY = -9999;
      let pointerInside = false;
      let rafId = 0;
      let isRunning = false;
      const currentWeights = [700, 700, 700, 700, 700, 700, 700];

      const step = () => {
        const isScrolled = isHeroScrolledRef.current;
        let isSettled = true;

        spans.forEach((span, i) => {
          let targetWeight = 700;
          if (!isScrolled && pointerInside && centers[i]) {
            const dx = pointerX - centers[i].x;
            const dy = pointerY - centers[i].y;
            const dist = Math.hypot(dx, dy);

            if (dist < 220) {
              // Smooth cosine falloff from 900 at 0px to 400 at 220px
              const t = (1 + Math.cos((dist / 220) * Math.PI)) / 2;
              targetWeight = 400 + 500 * t;
            } else {
              targetWeight = 400;
            }
          }

          const diff = targetWeight - currentWeights[i];
          if (Math.abs(diff) > 0.4) {
            currentWeights[i] += diff * 0.12;
            isSettled = false;
          } else {
            currentWeights[i] = targetWeight;
          }

          span.style.fontVariationSettings = `'wght' ${Math.round(currentWeights[i])}`;
        });

        if (!isSettled || (pointerInside && !isScrolled)) {
          rafId = requestAnimationFrame(step);
        } else {
          isRunning = false;
          spans.forEach((span) => {
            span.style.willChange = 'auto';
          });
        }
      };

      const startRaf = () => {
        if (!isRunning) {
          isRunning = true;
          spans.forEach((span) => {
            span.style.willChange = 'font-variation-settings';
          });
          rafId = requestAnimationFrame(step);
        }
      };

      const handlePointerMove = (e: PointerEvent) => {
        pointerX = e.clientX;
        pointerY = e.clientY;
        pointerInside = true;
        startRaf();
      };

      const handlePointerLeave = () => {
        pointerInside = false;
        startRaf();
      };

      const handleResize = () => {
        updateCenters();
      };

      sticky.addEventListener('pointermove', handlePointerMove, { passive: true });
      sticky.addEventListener('pointerleave', handlePointerLeave, { passive: true });
      window.addEventListener('resize', handleResize, { passive: true });

      cleanup = () => {
        cancelAnimationFrame(rafId);
        sticky.removeEventListener('pointermove', handlePointerMove);
        sticky.removeEventListener('pointerleave', handlePointerLeave);
        window.removeEventListener('resize', handleResize);
      };
    }, 400);

    return () => {
      cancelIdle();
      cleanup();
    };
  }, [isLite]);

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

    const t0 = setTimeout(() => {
      setIsIntroActive(true);
      setIntroPhase('dark');
    }, 0);
    const t1 = setTimeout(() => setIntroPhase('tracing'), 350);
    const t2 = setTimeout(() => setIntroPhase('igniting'), 1000);
    const t3 = setTimeout(() => setIntroPhase('opening'), 1700);
    const t4 = setTimeout(() => { skipIntro(); }, 2800);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skipIntro();
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

  // Scene 2 (Scroll): CSS sticky wrapper + GSAP ScrollTrigger on the wrapper
  // NO pin, NO pin-spacer — just a tall div and sticky child.
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
            const wrapper = wrapperRef.current;   // tall scroll wrapper = trigger
            const portal = portalWrapperRef.current;
            const ring = portalRingRef.current;
            const chamber = chamberRef.current;
            const textGroup = textGroupRef.current;
            const ctaLink = ctaLinkRef.current;
            const vignette = vignetteRef.current;
            const shockwave = shockwaveRef.current;

            if (!wrapper || !textGroup) return;

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: wrapper,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.5,
                onUpdate: (self) => {
                  const p = self.progress;
                  isHeroScrolledRef.current = p > 0.02;

                  // Scale < 0.5 happens around progress 0.22
                  const isShrunk = p >= 0.22;
                  textGroup.style.pointerEvents = isShrunk ? 'none' : '';
                  if (ctaLink) {
                    if (isShrunk) {
                      ctaLink.setAttribute('tabindex', '-1');
                    } else {
                      ctaLink.removeAttribute('tabindex');
                    }
                  }
                },
              },
            });

            // === Phase 0.00 -> 0.12: HOLD ===
            // Hero sits fully formed
            tl.set({}, {}, 0.12);

            // === Phase 0.10 -> 0.40: CAMERA DOLLY + COPY INTAKE ===
            // Chamber background scales subtly 1.0 -> 1.08 with layered parallax
            if (farLayerRef.current) {
              tl.to(farLayerRef.current, { scale: 1.04, y: -6, duration: 0.30, ease: 'power1.inOut' }, 0.10);
            }
            if (midLayerRef.current) {
              tl.to(midLayerRef.current, { scale: 1.08, y: -12, duration: 0.30, ease: 'power1.inOut' }, 0.10);
            }
            if (nearLayerRef.current) {
              tl.to(nearLayerRef.current, { scale: 1.15, y: -20, duration: 0.30, ease: 'power1.inOut' }, 0.10);
            }

            // Entire copy group moves inward: scale 1.0 -> 0.15, translate Y slightly upward, slight perspective tilt < 6 deg
            tl.to(
              textGroup,
              {
                scale: 0.15,
                y: -40,
                rotationX: 4,
                transformOrigin: 'center center',
                duration: 0.30,
                ease: 'power2.in',
              },
              0.10
            );

            // Late fade for copy: opacity stays 1.0 until scale < 0.35, then fades out 0.32 -> 0.40
            tl.to(
              textGroup,
              {
                opacity: 0,
                duration: 0.08,
                ease: 'power1.in',
              },
              0.32
            );

            // === Phase 0.35 -> 0.75: RING CONTRACTION + IRIS + SPARK PEEL ===
            if (ring) {
              tl.to(
                ring,
                {
                  scale: 0.35,
                  opacity: 0.85,
                  rotation: 12,
                  transformOrigin: 'center center',
                  duration: 0.40,
                  ease: 'power2.in',
                },
                0.35
              );
            }
            if (chamber) {
              tl.to(
                chamber,
                {
                  scale: 0.20,
                  opacity: 0.15,
                  transformOrigin: 'center center',
                  duration: 0.40,
                  ease: 'power2.in',
                },
                0.35
              );
            }
            if (portal) {
              tl.to(
                portal,
                {
                  scale: 0.55,
                  transformOrigin: 'center center',
                  duration: 0.40,
                  ease: 'power2.in',
                },
                0.35
              );
            }
            if (vignette) {
              tl.to(
                vignette,
                {
                  opacity: 0.95,
                  duration: 0.40,
                  ease: 'power2.in',
                },
                0.35
              );
            }

            // === Phase 0.72 -> 0.92: SINGULARITY ===
            // Ring snaps from 0.35 -> 0 (scale down to a point)
            if (ring) {
              tl.to(
                ring,
                {
                  scale: 0,
                  opacity: 0,
                  duration: 0.12,
                  ease: 'power4.in',
                  transformOrigin: 'center center',
                },
                0.72
              );
            }
            if (chamber) {
              tl.to(
                chamber,
                {
                  scale: 0,
                  opacity: 0,
                  duration: 0.12,
                  ease: 'power4.in',
                  transformOrigin: 'center center',
                },
                0.72
              );
            }
            if (portal) {
              tl.to(
                portal,
                {
                  scale: 0,
                  opacity: 0,
                  duration: 0.12,
                  ease: 'power4.in',
                  transformOrigin: 'center center',
                },
                0.72
              );
            }

            // Singularity bright white-gold flare appears at 0.72, peaks at 0.78, fades by 0.90
            if (singularityRef.current) {
              tl.fromTo(
                singularityRef.current,
                { scale: 0.2, opacity: 0 },
                { scale: 1.4, opacity: 1, duration: 0.08, ease: 'power2.out' },
                0.72
              );
              tl.to(
                singularityRef.current,
                { scale: 0, opacity: 0, duration: 0.12, ease: 'power2.in' },
                0.80
              );
            }

            // Single circular shockwave ring expands outward and dissipates
            if (shockwave) {
              tl.fromTo(
                shockwave,
                { scale: 0.2, opacity: 0.9 },
                { scale: 2.2, opacity: 0, duration: 0.16, ease: 'power1.out', transformOrigin: 'center center' },
                0.74
              );
            }

            // === Phase 0.90 -> 1.00: DISSOLVE & EXIT ===
            if (exitVoidRef.current) {
              tl.to(exitVoidRef.current, { opacity: 1, duration: 0.10, ease: 'none' }, 0.90);
            }

            // Next section content rises gently (translateY 30px -> 0, opacity 0.4 -> 1.0)
            const nextSection = document.getElementById('time-convergence');
            if (nextSection) {
              tl.fromTo(
                nextSection,
                { y: 30, opacity: 0.4 },
                { y: 0, opacity: 1, duration: 0.10, ease: 'power1.out' },
                0.90
              );
            }
          });
        }, wrapperRef);
      } catch (err) {
        console.warn('Hero GSAP scroll scrub skipped:', err);
      }
    };

    const cancelIdle = runAfterLoadAndIdle(initScrollTrigger, 800);

    return () => {
      cancelIdle();
      ctx?.revert();
    };
  }, [isLite]);

  // Whether to use sticky layout (JS available + not lite + not reduced motion)
  // Computed once at mount using useMemo (stable in SPA — no SSR hydration).
  const useStickyLayout = useMemo(() => {
    if (typeof window === 'undefined' || isLite) return false;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, [isLite]);

  return (
    /*
     * OUTER: tall scroll wrapper
     * ~260vh desktop / ~180vh mobile so the portal closing animation
     * plays out across a comfortable scroll distance.
     * Reduced motion / lite / no-JS: just a normal section, no sticky, scrolls away.
     */
    <div
      ref={wrapperRef}
      id="festival-hero-wrapper"
      className={
        useStickyLayout
          ? 'relative w-full h-[180svh] sm:h-[210svh] lg:h-[240svh] overflow-clip bg-[#07060D]'
          : 'relative w-full bg-[#07060D]'
      }
    >
      {/*
       * INNER: sticky child = the visible hero.
       * Always 100svh tall, sticks to top while wrapper scrolls.
       * Non-sticky fallback: normal section height.
       */}
      <div
        ref={stickyRef}
        id="festival-hero"
        aria-label="Festival Hero"
        onClick={isIntroActive ? skipIntro : undefined}
        className={
          useStickyLayout
            ? 'sticky top-0 left-0 right-0 h-[100svh] flex items-center justify-center overflow-hidden select-none'
            : 'relative w-full min-h-[92vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 select-none'
        }
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
          {/* Layer 0: Far Windows with Twilight Glow */}
          <div
            ref={farLayerRef}
            className="absolute inset-0 pointer-events-none flex items-center justify-center transition-transform duration-300 ease-out z-0"
            aria-hidden="true"
          >
            <div className="w-[850px] max-w-[95vw] h-[850px] max-h-[95vh] rounded-full bg-[radial-gradient(circle_at_center,rgba(30,40,86,0.35)_0%,rgba(15,20,46,0.2)_40%,transparent_70%)] flex items-center justify-center">
              <svg viewBox="0 0 800 800" className="w-full h-full opacity-40" fill="none">
                <circle cx="400" cy="400" r="380" stroke="#F5B642" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="8 12" />
                <circle cx="400" cy="400" r="350" stroke="#3BA3FF" strokeWidth="0.8" strokeOpacity="0.15" />
                <line x1="400" y1="50" x2="400" y2="750" stroke="#F5B642" strokeWidth="1" strokeOpacity="0.15" />
                <line x1="50" y1="400" x2="750" y2="400" stroke="#F5B642" strokeWidth="1" strokeOpacity="0.15" />
              </svg>
            </div>
          </div>

          {/* Layer 1: Mid Fluted Stone Columns flanking the chamber */}
          <div
            ref={midLayerRef}
            className="absolute inset-0 pointer-events-none flex justify-between items-center px-4 sm:px-12 md:px-24 transition-transform duration-300 ease-out z-0"
            aria-hidden="true"
          >
            <div className="w-12 sm:w-16 md:w-24 h-full bg-gradient-to-r from-[#040509] via-[#0E101B] to-transparent opacity-85 border-r border-[#F5B642]/10" />
            <div className="w-12 sm:w-16 md:w-24 h-full bg-gradient-to-l from-[#040509] via-[#0E101B] to-transparent opacity-85 border-l border-[#F5B642]/10" />
          </div>

          {/* Layer 2: Soft Volumetric Light Shafts */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
            <div className="absolute -top-[20%] left-[8%] w-[380px] sm:w-[520px] h-[140%] bg-gradient-to-b from-[#FFE082]/12 via-[#FF7A1A]/04 to-transparent rotate-[-24deg] origin-top blur-xl animate-light-shaft pointer-events-none" />
            <div className="absolute -top-[20%] right-[10%] w-[320px] sm:w-[460px] h-[140%] bg-gradient-to-b from-[#FFE082]/10 via-[#F5B642]/03 to-transparent rotate-[22deg] origin-top blur-xl animate-light-shaft pointer-events-none [animation-delay:4.5s]" />
          </div>

          {/* Layer 3: Dominant Sling Ring Portal (Behind Headline Text) */}
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

          {/* Layer 4: Near Stone Foreground & Dark Vignette */}
          <div
            ref={nearLayerRef}
            className="absolute inset-0 pointer-events-none z-10 transition-transform duration-300 ease-out"
            aria-hidden="true"
          >
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#07060D] via-[#07060D]/80 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(7,6,13,0.85)_100%)] pointer-events-none" />
          </div>

          {/* Layer 4b: Iris Vignette (closes in during portal collapse, starts fully transparent) */}
          <div
            ref={vignetteRef}
            className="absolute inset-0 pointer-events-none z-[11]"
            aria-hidden="true"
            style={{ opacity: 0, background: 'radial-gradient(circle at center, transparent 25%, #07060D 65%)' }}
          />

          {/* Layer 5: Film Grain & Floating Dust Motes */}
          <div className="absolute inset-0 pointer-events-none bg-film-grain opacity-60 z-20" aria-hidden="true" />

          {!isLite && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 hidden lg:block" aria-hidden="true">
              {DUST_MOTES.map((mote, i) => (
                <span
                  key={i}
                  className="absolute rounded-full bg-[#FFE5A3] animate-dust-mote"
                  style={{
                    top: mote.top,
                    left: mote.left,
                    width: `${mote.size}px`,
                    height: `${mote.size}px`,
                    boxShadow: '0 0 4px rgba(255,122,26,0.6)',
                    // @ts-expect-error custom css variable
                    '--dust-dur': mote.dur,
                    animationDelay: mote.delay,
                  }}
                />
              ))}
            </div>
          )}

          {/* Shockwave ring: shown when portal collapses to a point (animated via GSAP fromTo) */}
          <div
            ref={shockwaveRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[12] pointer-events-none"
            aria-hidden="true"
            style={{ width: 240, height: 240, opacity: 0 }}
          >
            <svg viewBox="0 0 240 240" className="w-full h-full" fill="none">
              <circle cx="120" cy="120" r="110" stroke="#FFFFFF" strokeWidth="3" strokeOpacity="0.9" />
              <circle cx="120" cy="120" r="110" stroke="#F5B642" strokeWidth="6" strokeOpacity="0.5" />
            </svg>
          </div>

          {/* Singularity flare point (Phase 72-92%) */}
          <div
            ref={singularityRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[13] pointer-events-none rounded-full bg-white shadow-[0_0_16px_#FFE5A3,0_0_36px_#FF7A1A]"
            aria-hidden="true"
            style={{ width: 8, height: 8, opacity: 0 }}
          />

          {/* Exit void overlay (Phase 90-100%): fades in to complete the transition cleanly */}
          <div
            ref={exitVoidRef}
            className="absolute inset-0 bg-[#07060D] z-[14] pointer-events-none"
            aria-hidden="true"
            style={{ opacity: 0 }}
          />

          {/* Layer 6: Foreground Content (Always real text visible in first paint for LCP) */}
          <div
            ref={textGroupRef}
            id="hero-portal-content"
            className={`relative z-30 max-w-4xl mx-auto flex flex-col items-center text-center space-y-6 px-4 sm:px-6 ${
              useStickyLayout ? 'pt-[var(--navbar-height)]' : 'pt-4'
            }`}
          >
            {/* Real H1 Title (LCP Element — NEVER hidden by JS per Hard Rule 2) */}
            <div className="relative inline-block">
              <h1
                ref={h1Ref}
                aria-label="STRANGE"
                className="hero-title font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.14em] text-[#F3EFE8] leading-none drop-shadow-2xl select-none"
                style={{ fontWeight: 700 }}
              >
                <span className="hero-ch" aria-hidden="true">S</span>
                <span className="hero-ch" aria-hidden="true">T</span>
                <span className="hero-ch" aria-hidden="true">R</span>
                <span className="hero-ch text-[#FF7A1A]" aria-hidden="true">A</span>
                <span className="hero-ch" aria-hidden="true">N</span>
                <span className="hero-ch" aria-hidden="true">G</span>
                <span className="hero-ch" aria-hidden="true">E</span>
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
                ref={ctaLinkRef}
                id="hero-explore-cta"
                to="/events"
                className="inline-flex items-center justify-center font-bold text-sm sm:text-base uppercase tracking-wider px-8 py-3.5 rounded-md bg-[#FF7A1A] text-[#07060D] hover:bg-[#F5B642] transition-colors active:scale-95 shadow-[0_0_24px_rgba(255,122,26,0.5)] border border-[#FFE082]"
              >
                Explore Events
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade: blends the sticky hero into the section below when the portal has collapsed */}
        <div
          className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#07060D] via-[#07060D]/60 to-transparent pointer-events-none z-40"
          aria-hidden="true"
        />
      </div>

      {/* After the sticky child ends: transparent spacer so the wrapper's bottom is reachable */}
      {useStickyLayout && (
        <div className="h-[100svh] pointer-events-none" aria-hidden="true" />
      )}
    </div>
  );
};
