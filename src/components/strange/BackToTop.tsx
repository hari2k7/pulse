import { useEffect, useState, useRef, type FC, type CSSProperties } from 'react';
import { useLocation } from 'react-router-dom';

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
}

export const BackToTop: FC = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const sweepTimerRef = useRef<number | null>(null);

  const pathname = location.pathname;
  const isAllowedRoute = pathname === '/' || pathname === '/events';

  // Handle visibility based on route
  useEffect(() => {
    if (!isAllowedRoute) {
      return;
    }

    let observer: IntersectionObserver | null = null;
    let handleScroll: (() => void) | null = null;

    if (pathname === '/') {
      // HOME: appears only after the entire first hero screen has scrolled completely out of view
      const hero =
        document.querySelector('[aria-label="Festival Hero"]') ||
        document.getElementById('festival-hero') ||
        document.querySelector('main > section:first-of-type');

      if (hero) {
        observer = new IntersectionObserver(
          ([entry]) => {
            // When hero is completely out of view (isIntersecting false)
            setVisible(!entry.isIntersecting);
          },
          { threshold: 0 }
        );
        observer.observe(hero);
      } else {
        // Fallback to scroll position if hero element selector fails
        handleScroll = () => {
          setVisible(window.scrollY > 750);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
      }
    } else if (pathname === '/events') {
      // EVENTS: appears after scrolling past heading/filters (~600px)
      handleScroll = () => {
        setVisible(window.scrollY > 600);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }

    return () => {
      if (observer) observer.disconnect();
      if (handleScroll) window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname, isAllowedRoute]);

  // Clean up timers on unmount
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

    if (prefersReducedMotion) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    // Generate max 12 pooled particles for short golden burst
    const newParticles: Particle[] = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      angle: (i * 360) / 12,
      distance: 28 + (i % 3) * 10,
      size: i % 2 === 0 ? 3.5 : 2.5,
    }));
    setParticles(newParticles);
    setIsSweeping(true);

    // Smooth scroll to top without blocking
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (sweepTimerRef.current) {
      window.clearTimeout(sweepTimerRef.current);
    }

    sweepTimerRef.current = window.setTimeout(() => {
      setIsSweeping(false);
      setParticles([]);
    }, 600);
  };

  return (
    <div
      className={`fixed z-30 transition-all duration-300 ease-out select-none ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
      style={{
        right: '20px',
        bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="relative group">
        {/* Tooltip bubble on hover / focus-visible (hidden on touch) */}
        <div
          role="tooltip"
          className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-[#07060D] border border-[#F5B642]/50 text-[#F3EFE8] text-[11px] font-sans font-semibold tracking-wide shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 pointer-events-none hidden md:block"
        >
          Back to Top
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#07060D]"
            aria-hidden="true"
          />
        </div>

        {/* Real button element: 56px visual size, 48px min hit area */}
        <button
          type="button"
          onClick={handleClick}
          aria-label="Back to top"
          className={`relative w-14 h-14 min-w-[48px] min-h-[48px] rounded-full p-0 flex items-center justify-center bg-transparent border-none outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07060D] transition-transform duration-300 ease-out motion-reduce:transition-none cursor-pointer ${
            isSweeping
              ? '-translate-y-12 scale-90 opacity-0 duration-500'
              : 'hover:scale-110 active:scale-95 motion-safe:hover:-rotate-3 motion-reduce:transform-none'
          }`}
        >
          {/* Subtle floating cloak idle animation wrapper (disabled on reduced motion & touch) */}
          <div className="w-full h-full motion-safe:animate-cloak-float motion-reduce:animate-none">
            <svg
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-[0_4px_16px_rgba(200,16,46,0.45)]"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="cloak-primary-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E61E38" />
                  <stop offset="50%" stopColor="#C8102E" />
                  <stop offset="100%" stopColor="#66000E" />
                </linearGradient>
                <linearGradient id="cloak-collar-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C8102E" />
                  <stop offset="100%" stopColor="#FF4A65" />
                </linearGradient>
                <linearGradient id="gold-trim-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE4A0" />
                  <stop offset="50%" stopColor="#F5B642" />
                  <stop offset="100%" stopColor="#B37812" />
                </linearGradient>
                <linearGradient id="arrow-glow-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#FF7A1A" />
                  <stop offset="50%" stopColor="#F5B642" />
                  <stop offset="100%" stopColor="#FFF8E7" />
                </linearGradient>
                <filter id="arrow-glow-filter" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Circular backing aura & portal ring */}
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="#0A0812"
                stroke="url(#gold-trim-grad)"
                strokeWidth="1.5"
                strokeOpacity="0.45"
              />

              {/* Cloak of Levitation Mantle Silhouette */}
              <path
                d="M 18 20 C 14 30, 15 44, 18 50 C 23 52, 28 48, 32 50 C 36 48, 41 52, 46 50 C 49 44, 50 30, 46 20 C 42 16, 38 18, 32 20 C 26 18, 22 16, 18 20 Z"
                fill="url(#cloak-primary-grad)"
              />

              {/* Popped High Collar Wings with Gold Trim */}
              <path
                d="M 17 24 C 14 15, 18 10, 24 14 C 28 17, 30 21, 32 24 C 27 24, 21 24, 17 24 Z"
                fill="url(#cloak-collar-grad)"
                stroke="url(#gold-trim-grad)"
                strokeWidth="1"
              />
              <path
                d="M 47 24 C 50 15, 46 10, 40 14 C 36 17, 34 21, 32 24 C 37 24, 43 24, 47 24 Z"
                fill="url(#cloak-primary-grad)"
                stroke="url(#gold-trim-grad)"
                strokeWidth="1"
              />

              {/* Gold Brooch Clasp at collar */}
              <circle cx="32" cy="23" r="3" fill="#07060D" stroke="url(#gold-trim-grad)" strokeWidth="1.5" />
              <circle cx="32" cy="23" r="1.2" fill="#FFE4A0" />

              {/* Glowing Mystic Upward Arrow */}
              <g filter="url(#arrow-glow-filter)" className="transition-opacity duration-200">
                <path
                  d="M 32 17 L 41 29 L 36 29 L 36 43 L 28 43 L 28 29 L 23 29 Z"
                  fill="url(#arrow-glow-grad)"
                />
              </g>
            </svg>
          </div>
        </button>

        {/* Upward Particle Burst (Pooled max 12 elements on click, transform & opacity only) */}
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
                transition: 'transform 550ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 550ms ease-out',
              };
              return (
                <span
                  key={p.id}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F5B642] shadow-[0_0_6px_#FF7A1A]"
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
