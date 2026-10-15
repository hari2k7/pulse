import { useEffect, useRef, type FC, type RefObject } from 'react';
import { runAfterLoadAndIdle } from '../../lib/idle';
import { useEffectsBudget } from '../../hooks/useEffectsBudget';
import { SanctumChamberWorld } from './SanctumChamberWorld';

export interface SlingRingPortalProps {
  className?: string;
  size?: number;
  introPhase?: 'tracing' | 'igniting' | 'opening' | 'done';
  ringRef?: RefObject<SVGGElement | null>;
  chamberRef?: RefObject<HTMLDivElement | null>;
}

/**
 * Sling Ring Portal Component
 * Dominant visual language for the STRANGE Multiverse:
 * - Molten, irregular fiery ring (bright golden-white core edge, irregular thickness, fiery arcs)
 * - Sanctum chamber visible through its centre
 * - Heat shimmer SVG filter (feTurbulence + feDisplacementMap) only on the ring element, desktop non-lite only
 * - Single capped canvas for ambient sparks (started after load+idle, paused offscreen, OFF on mobile/lite/reduced-motion)
 * - Honors prefers-reduced-motion and lite mode
 */
export const SlingRingPortal: FC<SlingRingPortalProps> = ({
  className = '',
  size = 560,
  introPhase = 'done',
  ringRef,
  chamberRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const budget = useEffectsBudget();
  const isLite = budget === 'lite';

  // Desktop non-lite shimmer support check
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  const isShimmerAllowed = !isLite && isDesktop;

  // Single capped canvas sparks: loaded after window load + idle
  useEffect(() => {
    if (typeof window === 'undefined' || isLite || window.innerWidth < 768) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let width = (canvas.width = canvas.offsetWidth || size);
    let height = (canvas.height = canvas.offsetHeight || size);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || size;
      height = canvas.height = canvas.offsetHeight || size;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Single capped particle pool (max 22 particles)
    const particleCount = 22;
    const radius = Math.min(width, height) * 0.40;
    const centerX = width / 2;
    const centerY = height / 2;

    interface Spark {
      angle: number;
      speed: number;
      distance: number;
      tangentSpeed: number;
      size: number;
      alpha: number;
      color: string;
    }

    const colors = ['#FFE5A3', '#F5B642', '#FF7A1A', '#FF4500', '#FFFFFF'];

    const sparks: Spark[] = Array.from({ length: particleCount }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: (0.012 + Math.random() * 0.018) * (Math.random() > 0.3 ? 1 : -1),
      distance: radius + (Math.random() * 24 - 12),
      tangentSpeed: Math.random() * 0.6 - 0.3,
      size: Math.random() * 2.2 + 1,
      alpha: Math.random() * 0.75 + 0.25,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    // Pause when offscreen
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && containerRef.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
        },
        { threshold: 0.05 }
      );
      observer.observe(containerRef.current);
    }

    const render = () => {
      if (!isVisible || document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i];
        s.angle += s.speed;
        s.distance += s.tangentSpeed;

        if (Math.abs(s.distance - radius) > 30) {
          s.distance = radius + (Math.random() * 12 - 6);
          s.tangentSpeed = Math.random() * 0.6 - 0.3;
        }

        const x = centerX + Math.cos(s.angle) * s.distance;
        const y = centerY + Math.sin(s.angle) * s.distance;

        ctx.beginPath();
        ctx.arc(x, y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    const cancelIdle = runAfterLoadAndIdle(() => {
      animationFrameId = requestAnimationFrame(render);
    }, 1500);

    return () => {
      cancelIdle();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (observer) observer.disconnect();
    };
  }, [budget, size, isLite]);

  // Dynamic class states based on intro phase
  const isChamberVisible = introPhase === 'opening' || introPhase === 'done';
  const isRingActive = introPhase !== 'tracing';

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* 0. SVG Shimmer Filter Definition (only on ring element, never full screen) */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id="portal-heat-shimmer" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.035 0.08"
              numOctaves="2"
              result="warp"
            >
              <animate
                attributeName="baseFrequency"
                dur="9s"
                values="0.035 0.08; 0.045 0.12; 0.035 0.08"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="warp" scale="4.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Layer 1: Ambient Radial Golden Haze */}
      <div
        className={`absolute inset-[-10%] rounded-full bg-[radial-gradient(circle,rgba(255,122,26,0.22)_0%,rgba(245,182,66,0.12)_45%,transparent_70%)] transition-opacity duration-700 pointer-events-none ${
          isRingActive ? 'opacity-100' : 'opacity-20'
        }`}
      />

      {/* Layer 2: Center Sanctum Chamber World (Circular aperture inside the ring) */}
      <div
        ref={chamberRef}
        className={`absolute w-[78%] h-[78%] rounded-full overflow-hidden transition-all duration-1000 ease-out z-0 ${
          isChamberVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
        style={{
          boxShadow: 'inset 0 0 35px rgba(255,122,26,0.5), inset 0 0 70px rgba(7,6,13,0.8)',
        }}
      >
        <SanctumChamberWorld />
      </div>

      {/* Layer 3: Sling Ring Molten Geometry (Inline SVG) */}
      <svg
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 overflow-visible"
      >
        <defs>
          {/* Molten Gold/Orange Gradient */}
          <linearGradient id="sling-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#FFE082" />
            <stop offset="55%" stopColor="#F5B642" />
            <stop offset="80%" stopColor="#FF7A1A" />
            <stop offset="100%" stopColor="#D84315" />
          </linearGradient>

          {/* Searing Core Glow Gradient */}
          <linearGradient id="sling-ring-core" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF9C4" />
            <stop offset="40%" stopColor="#FFE082" />
            <stop offset="70%" stopColor="#FF7A1A" />
            <stop offset="100%" stopColor="#BF360C" />
          </linearGradient>
        </defs>

        {/* Ring Group with Heat Shimmer Filter (desktop non-lite only) */}
        <g
          ref={ringRef}
          style={{
            filter: isShimmerAllowed ? 'url(#portal-heat-shimmer)' : undefined,
            transformOrigin: '300px 300px',
          }}
        >
          {/* Outer Fiery Corona Arc 1: Clockwise fast (14s) */}
          <g className="animate-spell-spin" style={{ animationDuration: '14s', transformOrigin: '300px 300px' }}>
            <circle
              cx="300"
              cy="300"
              r="244"
              stroke="url(#sling-ring-gradient)"
              strokeWidth="6"
              strokeDasharray="180 50 90 40 140 60"
              strokeLinecap="round"
              strokeOpacity="0.85"
            />
            {/* Searing sparks on rim */}
            <circle cx="544" cy="300" r="4" fill="#FFFFFF" />
            <circle cx="300" cy="544" r="3.5" fill="#FFE5A3" />
            <circle cx="127" cy="127" r="3" fill="#F5B642" />
          </g>

          {/* Inner Fiery Arc 2: Counter-Clockwise (10s) */}
          <g className="animate-spell-spin-reverse" style={{ animationDuration: '10s', transformOrigin: '300px 300px' }}>
            <circle
              cx="300"
              cy="300"
              r="238"
              stroke="url(#sling-ring-core)"
              strokeWidth="8"
              strokeDasharray="90 30 160 40 70 50"
              strokeLinecap="round"
              strokeOpacity="0.9"
            />
            <circle cx="300" cy="62" r="4.5" fill="#FFFFFF" />
            <circle cx="473" cy="473" r="3.5" fill="#FFE082" />
          </g>

          {/* Searing Bright Core Edge: Irregular molten line (8s spin) */}
          <g className="animate-spell-spin" style={{ animationDuration: '8s', transformOrigin: '300px 300px' }}>
            <circle
              cx="300"
              cy="300"
              r="234"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeDasharray="60 20 120 15 40 30"
              strokeLinecap="round"
              strokeOpacity="0.95"
            />
            <circle
              cx="300"
              cy="300"
              r="242"
              stroke="#FF7A1A"
              strokeWidth="12"
              strokeDasharray="30 140 50 110"
              strokeLinecap="round"
              strokeOpacity="0.6"
            />
          </g>

          {/* Deep Plasma Base Ring */}
          <circle
            cx="300"
            cy="300"
            r="236"
            stroke="#F5B642"
            strokeWidth="2.5"
            strokeOpacity="0.7"
          />

          {/* Spark Tracing Arc during intro (or full in resting state) */}
          {introPhase === 'tracing' && (
            <circle
              cx="300"
              cy="300"
              r="238"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeDasharray="1500"
              className="animate-spark-trace"
              style={{ strokeDashoffset: '1500' }}
            />
          )}
        </g>
      </svg>

      {/* Layer 4: Optional single capped canvas for ambient hero sparks (desktop non-lite only) */}
      {!isLite && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          aria-hidden="true"
        />
      )}
    </div>
  );
};
