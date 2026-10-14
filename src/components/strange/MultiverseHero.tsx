import { useEffect, useRef, type FC } from 'react';
import { Link } from 'react-router-dom';
import { SlingRingPortal } from './SlingRingPortal';
import { CloakSilhouette } from './CloakSilhouette';
import { FESTIVAL_CONFIG } from '../../config/festival';
import type { EventSummary } from '../../lib/types';

export interface MultiverseHeroProps {
  firstOpenEvent?: EventSummary | null;
}

export const MultiverseHero: FC<MultiverseHeroProps> = ({ firstOpenEvent }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const portalWrapperRef = useRef<HTMLDivElement>(null);
  const textGroupRef = useRef<HTMLDivElement>(null);

  // GSAP dynamic import for progressive enhancement without layout shift or pinning
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ctx: gsap.Context | null = null;

    const initGsap = async () => {
      try {
        const { gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          const mm = gsap.matchMedia();

          mm.add('(prefers-reduced-motion: no-preference)', () => {
            // Portal subtle scale & parallax on scroll (transform only, no pinning)
            if (portalWrapperRef.current && heroRef.current) {
              gsap.to(portalWrapperRef.current, {
                scale: 1.15,
                y: 80,
                ease: 'none',
                scrollTrigger: {
                  trigger: heroRef.current,
                  start: 'top top',
                  end: 'bottom top',
                  scrub: 0.5,
                },
              });
            }

            // Text subtle counter-parallax
            if (textGroupRef.current && heroRef.current) {
              gsap.to(textGroupRef.current, {
                y: -40,
                opacity: 0.85,
                ease: 'none',
                scrollTrigger: {
                  trigger: heroRef.current,
                  start: 'top top',
                  end: 'bottom top',
                  scrub: 0.5,
                },
              });
            }
          });
        }, heroRef);
      } catch (err) {
        // Fallback gracefully without throwing
        console.warn('GSAP enhancement skipped:', err);
      }
    };

    // Defer GSAP initialization after first paint
    const timer = setTimeout(initGsap, 50);

    return () => {
      clearTimeout(timer);
      ctx?.revert();
    };
  }, []);

  // Registration CTA behavior per Non-Negotiable Constraint 2
  const registerCta = firstOpenEvent?.registration_status === 'OPEN'
    ? {
        label: 'Register For Events',
        to: `/events/${firstOpenEvent.id}`,
      }
    : {
        label: 'How To Register',
        to: '/events',
      };

  return (
    <section
      ref={heroRef}
      className="relative w-full min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-[#07060D] pt-24 pb-16 px-4 sm:px-6 lg:px-8"
      aria-label="Festival Hero"
    >
      {/* Background Layer 1: Ambient Stars & Crimson Cloak Silhouette */}
      <div className="absolute inset-0 pointer-events-none select-none z-0" aria-hidden="true">
        <div className="absolute right-[-10%] top-[-5%] w-[450px] md:w-[650px] h-[700px] opacity-25">
          <CloakSilhouette variant="silhouette" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,40,200,0.15),rgba(255,122,26,0.08)_50%,transparent_100%)]" />
      </div>

      {/* Background Layer 2: Sling Ring Portal (Centered behind headline) */}
      <div
        ref={portalWrapperRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-85"
        aria-hidden="true"
      >
        <SlingRingPortal size={560} />
      </div>

      {/* Foreground Content: Real text visible without JS for maximum LCP */}
      <div
        ref={textGroupRef}
        className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center space-y-6"
      >
        {/* Runic Realm Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D1020]/90 border border-[#FF7A1A]/30 backdrop-blur-md shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#FF7A1A] animate-pulse" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F5B642]">
            {FESTIVAL_CONFIG.collegeName ? `${FESTIVAL_CONFIG.collegeName} Presents` : 'Annual Multiverse Fest'}
          </span>
        </div>

        {/* Real H1 Title (LCP Element) */}
        <h1 className="font-display font-bold text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.12em] text-[#F3EFE8] leading-none drop-shadow-2xl">
          STR<span className="text-[#FF7A1A]">A</span>NGE
        </h1>

        {/* Tagline */}
        <p className="font-display text-lg sm:text-2xl md:text-3xl tracking-[0.2em] uppercase text-[#F5B642] max-w-2xl font-semibold">
          {FESTIVAL_CONFIG.tagline || 'A Tech Fest Beyond Reality.'}
        </p>

        {/* Honest Festival Logistics (From festival.ts, unset = hidden) */}
        {(FESTIVAL_CONFIG.startDate || FESTIVAL_CONFIG.venue) && (
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-[#B8B3C7] font-medium pt-1">
            {FESTIVAL_CONFIG.startDate && (
              <span className="px-3 py-1 rounded-md bg-[#0D1020]/80 border border-white/10">
                {new Date(FESTIVAL_CONFIG.startDate).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
                {FESTIVAL_CONFIG.endDate ? ` – ${new Date(FESTIVAL_CONFIG.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}` : ''}
              </span>
            )}
            {FESTIVAL_CONFIG.venue && (
              <span className="px-3 py-1 rounded-md bg-[#0D1020]/80 border border-white/10">
                📍 {FESTIVAL_CONFIG.venue}
              </span>
            )}
          </div>
        )}

        {/* Editorial Sub-copy */}
        <p className="text-sm sm:text-base text-[#B8B3C7] max-w-xl leading-relaxed">
          Traverse 30+ dimensional hackathons, workshops, and technical crucibles.
          Step through the Sling Ring and push the boundaries of engineering.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-wrap gap-4 justify-center pt-2">
          <Link
            to="/events"
            className="inline-flex items-center justify-center font-bold text-sm sm:text-base uppercase tracking-wider px-6 sm:px-8 py-3.5 rounded-md bg-gradient-to-r from-[#FF7A1A] to-[#F5B642] text-[#07060D] shadow-xl hover:shadow-[#FF7A1A]/40 transition-all hover:scale-105 active:scale-95"
          >
            Explore Events
          </Link>

          <Link
            to={registerCta.to}
            className="inline-flex items-center justify-center font-semibold text-sm sm:text-base uppercase tracking-wider px-6 sm:px-8 py-3.5 rounded-md bg-[#1A1030]/80 border border-[#FF7A1A]/40 text-[#F3EFE8] hover:border-[#FF7A1A] hover:bg-[#261845] transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
          >
            {registerCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
};
