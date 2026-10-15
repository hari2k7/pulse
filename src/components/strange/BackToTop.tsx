import { useEffect, useState, useRef, type FC, type CSSProperties } from 'react';
import { useLocation } from 'react-router-dom';
import { useEffectsBudget } from '../../hooks/useEffectsBudget';

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
}

/**
 * Realistic Cloak of Levitation Back to Top Component
 * - Original, detailed inline SVG with deep crimson velvet, layered soft shading,
 *   many flowing fabric folds with highlights and shadow gradients.
 * - Tall stiff standing collar with gold embroidered trim, ragged flowing hem points,
 *   slightly asymmetrical billow, and soft contact shadow underneath.
 * - 4 States:
 *   1) Idle floating: slow translateY and gentle skew/sway
 *   2) Hover/focus unfurl: cloak widens, hem flutters, glowing upward arrow appears on the fabric
 *   3) Click sweep upward: gold particle burst (max 12 pooled), smooth scroll to top, settle & hide
 *   4) Touch/lite/reduced motion: static cloak, instant scroll, no particles
 */
export const BackToTop: FC = () => {
  const location = useLocation();
  const budget = useEffectsBudget();
  const [visible, setVisible] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const sweepTimerRef = useRef<number | null>(null);

  const pathname = location.pathname;
  const isAllowedRoute = pathname === '/' || pathname === '/events';
  const isLite = budget === 'lite';

  // Handle route-specific visibility
  useEffect(() => {
    if (!isAllowedRoute) {
      return;
    }

    let observer: IntersectionObserver | null = null;
    let handleScroll: (() => void) | null = null;

    if (pathname === '/') {
      // HOME: appears only after the entire hero section has scrolled completely out of view
      const hero =
        document.querySelector('[aria-label="Festival Hero"]') ||
        document.getElementById('festival-hero') ||
        document.querySelector('main > section:first-of-type');

      if (hero) {
        observer = new IntersectionObserver(
          ([entry]) => {
            // Visible when hero is not intersecting at all (scrolled completely past)
            setVisible(!entry.isIntersecting);
          },
          { threshold: 0 }
        );
        observer.observe(hero);
      } else {
        handleScroll = () => {
          setVisible(window.scrollY > 750);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
      }
    } else if (pathname === '/events') {
      // EVENTS: appears after scrolling past the header (~550px)
      handleScroll = () => {
        setVisible(window.scrollY > 550);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }

    return () => {
      if (observer) observer.disconnect();
      if (handleScroll) window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname, isAllowedRoute]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (sweepTimerRef.current) {
        window.clearTimeout(sweepTimerRef.current);
      }
    };
  }, []);

  if (!isAllowedRoute) return null;

  const handleClick = () => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || isLite) {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'instant' : 'smooth' });
      return;
    }

    // Generate max 12 pooled particles for gold burst
    const newParticles: Particle[] = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      angle: (i * 360) / 12,
      distance: 30 + (i % 3) * 12,
      size: i % 2 === 0 ? 3.5 : 2.5,
    }));
    setParticles(newParticles);
    setIsSweeping(true);

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (sweepTimerRef.current) {
      window.clearTimeout(sweepTimerRef.current);
    }

    sweepTimerRef.current = window.setTimeout(() => {
      setIsSweeping(false);
      setParticles([]);
    }, 650);
  };

  return (
    <div
      className={`back-to-top fixed z-40 transition-all duration-300 ease-out select-none ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
      style={{
        right: '24px',
        bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="relative group flex flex-col items-center">
        {/* Tooltip bubble on hover / focus-visible (hidden on mobile/touch) */}
        <div
          role="tooltip"
          className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-[#07060D] border border-[#F5B642]/50 text-[#F3EFE8] text-[11px] font-mono font-semibold tracking-wider shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 pointer-events-none hidden md:block"
        >
          Back to top
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#07060D]"
            aria-hidden="true"
          />
        </div>

        {/* 56px visual size, 48px minimum hit area */}
        <button
          type="button"
          onClick={handleClick}
          aria-label="Back to top"
          className={`relative w-14 h-14 min-w-[48px] min-h-[48px] rounded-full p-0 flex items-center justify-center bg-transparent border-none outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07060D] transition-transform duration-300 ease-out cursor-pointer ${
            isSweeping
              ? '-translate-y-14 scale-90 opacity-0 duration-500'
              : 'active:scale-95 motion-reduce:transform-none'
          }`}
        >
          {/* Floating Cloak Wrapper: Slow translateY and gentle skew/sway on idle; unfurls and flutters on hover */}
          <div className="w-full h-full motion-safe:animate-cloak-float motion-reduce:animate-none group-hover:scale-105 group-hover:scale-x-110 transition-transform duration-300 ease-out">
            <svg
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-[0_4px_16px_rgba(155,17,30,0.55)] overflow-visible"
              aria-hidden="true"
            >
              <defs>
                {/* 1. Deep Crimson Velvet Base Gradient */}
                <linearGradient id="cloak-velvet-base" x1="15%" y1="0%" x2="85%" y2="100%">
                  <stop offset="0%" stopColor="#A81226" />
                  <stop offset="30%" stopColor="#800010" />
                  <stop offset="70%" stopColor="#54000B" />
                  <stop offset="100%" stopColor="#300006" />
                </linearGradient>

                {/* 2. Velvet Sheen & Fold Highlight */}
                <linearGradient id="cloak-velvet-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E63956" stopOpacity="0.85" />
                  <stop offset="45%" stopColor="#C8102E" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#66000E" stopOpacity="0" />
                </linearGradient>

                {/* 3. Deep Shadow Drape for Billowing Folds */}
                <linearGradient id="cloak-fold-shadow" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#220004" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#4A000A" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#180003" stopOpacity="0.8" />
                </linearGradient>

                {/* 4. Standing Collar Inner Velvet */}
                <linearGradient id="cloak-collar-inner" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#C8102E" />
                  <stop offset="60%" stopColor="#7A0012" />
                  <stop offset="100%" stopColor="#400008" />
                </linearGradient>

                {/* 5. Gold Embroidered Trim Gradient */}
                <linearGradient id="cloak-gold-trim" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF2B2" />
                  <stop offset="35%" stopColor="#F5B642" />
                  <stop offset="70%" stopColor="#D49525" />
                  <stop offset="100%" stopColor="#8C590E" />
                </linearGradient>

                {/* 6. Glowing Mystic Upward Arrow */}
                <linearGradient id="cloak-arrow-glow" x1="50%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stopColor="#FF7A1A" />
                  <stop offset="50%" stopColor="#F5B642" />
                  <stop offset="100%" stopColor="#FFF8E7" />
                </linearGradient>

                {/* 7. Glow Filter for Mystic Arrow */}
                <filter id="cloak-glow-filter" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Protective Dark Mystic Portal Backing Disc */}
              <circle
                cx="32"
                cy="32"
                r="29"
                fill="#0A0812"
                fillOpacity="0.92"
                stroke="url(#cloak-gold-trim)"
                strokeWidth="1.2"
                strokeOpacity="0.35"
              />

              {/* CLOAK LAYER 1: Deep Crimson Velvet Mantle with Asymmetrical Billow */}
              {/* Ragged, flowing pointed hem across bottom (left billows slightly wider) */}
              <path
                d="M 18 20 C 13 28, 12 42, 14 50 C 18 53, 21 49, 25 53 C 28 49, 32 52, 35 48 C 39 53, 43 49, 47 52 C 50 45, 51 30, 47 20 C 43 17, 39 19, 32 21 C 25 19, 21 17, 18 20 Z"
                fill="url(#cloak-velvet-base)"
              />

              {/* CLOAK LAYER 2: Shadow Creases between Folds */}
              <path
                d="M 22 23 C 18 33, 17 44, 21 51 C 24 45, 27 34, 26 23 Z"
                fill="url(#cloak-fold-shadow)"
              />
              <path
                d="M 42 23 C 45 33, 46 44, 43 50 C 40 45, 37 34, 38 23 Z"
                fill="url(#cloak-fold-shadow)"
              />

              {/* CLOAK LAYER 3: Rich Flowing Velvet Surface Folds with Silk Highlights */}
              <path
                d="M 23 21 C 20 29, 21 41, 25 51 C 29 48, 33 50, 36 48 C 34 38, 33 27, 32 21 Z"
                fill="url(#cloak-velvet-highlight)"
              />
              <path
                d="M 32 21 C 33 27, 34 38, 36 48 C 40 51, 44 48, 46 51 C 47 41, 46 29, 42 21 Z"
                fill="url(#cloak-velvet-base)"
                opacity="0.85"
              />

              {/* CLOAK LAYER 4: Gold Embroidered Trim along the Ragged Flowing Hem */}
              <path
                d="M 14 50 C 18 53, 21 49, 25 53 C 28 49, 32 52, 35 48 C 39 53, 43 49, 47 52"
                stroke="url(#cloak-gold-trim)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* CLOAK LAYER 5: Tall Stiff Standing Collar with Flared Wings */}
              {/* Left Wing (flared upward and outward) */}
              <path
                d="M 17 23 C 13 13, 17 8, 25 13 C 29 16, 31 20, 32 23 C 27 23, 21 23, 17 23 Z"
                fill="url(#cloak-collar-inner)"
              />
              {/* Left Wing Gold Crest Trim */}
              <path
                d="M 17 23 C 13 13, 17 8, 25 13"
                stroke="url(#cloak-gold-trim)"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />

              {/* Right Wing (slightly asymmetrical stance) */}
              <path
                d="M 47 23 C 51 14, 47 9, 39 13 C 35 16, 33 20, 32 23 C 37 23, 43 23, 47 23 Z"
                fill="url(#cloak-collar-inner)"
              />
              {/* Right Wing Gold Crest Trim */}
              <path
                d="M 47 23 C 51 14, 47 9, 39 13"
                stroke="url(#cloak-gold-trim)"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />

              {/* Neck Juncture Cloak Brooch Clasp */}
              <circle cx="32" cy="22" r="2.8" fill="#07060D" stroke="url(#cloak-gold-trim)" strokeWidth="1.4" />
              <circle cx="32" cy="22" r="1.1" fill="#FFE5A3" />

              {/* CLOAK LAYER 6: Glowing Upward Mystic Arrow on the Fabric
                  Hidden at rest; appears on hover/focus unfurl */}
              <g
                filter="url(#cloak-glow-filter)"
                className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-250 ease-out"
              >
                <path
                  d="M 32 26 L 39 35 L 35 35 L 35 44 L 29 44 L 29 35 L 25 35 Z"
                  fill="url(#cloak-arrow-glow)"
                />
              </g>
            </svg>
          </div>
        </button>

        {/* Soft Contact Shadow underneath the Cloak (scales inversely with float height) */}
        <div
          className="w-8 h-1.5 rounded-full bg-black/60 blur-[2px] mt-0.5 motion-safe:animate-cloak-shadow motion-reduce:opacity-40"
          aria-hidden="true"
        />

        {/* Upward Particle Burst (Pooled max 12 particles, active on click only) */}
        {particles.length > 0 && (
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {particles.map((p) => {
              const rad = (p.angle * Math.PI) / 180;
              const x = Math.cos(rad) * p.distance;
              const y = Math.sin(rad) * p.distance;
              const style: CSSProperties = {
                width: `${p.size}px`,
                height: `${p.size}px`,
                transform: isSweeping ? `translate(${x}px, ${y}px)` : 'translate(0px, 0px)',
                opacity: isSweeping ? 0 : 1,
                transition: 'transform 550ms cubic-bezier(0.16, 1, 0.3, 1), opacity 550ms ease-out',
              };
              return (
                <span
                  key={p.id}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFE5A3] shadow-[0_0_8px_#FF7A1A]"
                  style={style}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
