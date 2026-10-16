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

  // Criterion A: Heat shimmer removed per effect shedding order
  const isShimmerAllowed = false;

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

    // Desktop 32 sparks, mobile/lite 10 (P2 requirement)
    const particleCount = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 32 : 10;
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
      trailLength: number;
    }

    const colors = ['#FFFFFF', '#FFE5A3', '#F5B642', '#FF7A1A', '#E11D48'];

    const sparks: Spark[] = Array.from({ length: particleCount }, (_, idx) => {
      // Uneven speeds: some fast searing sparks, some lingering embers
      const isFast = idx % 3 === 0;
      const baseSpeed = isFast ? 0.024 + Math.random() * 0.02 : 0.008 + Math.random() * 0.012;
      return {
        angle: Math.random() * Math.PI * 2,
        speed: baseSpeed * (Math.random() > 0.25 ? 1 : -1),
        distance: radius + (Math.random() * 26 - 13),
        tangentSpeed: Math.random() * 0.7 - 0.35,
        size: isFast ? Math.random() * 1.5 + 1.2 : Math.random() * 2.5 + 1.5,
        alpha: Math.random() * 0.7 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        trailLength: isFast ? Math.random() * 8 + 6 : Math.random() * 4 + 2,
      };
    });

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

        if (Math.abs(s.distance - radius) > 32) {
          s.distance = radius + (Math.random() * 14 - 7);
          s.tangentSpeed = Math.random() * 0.6 - 0.3;
        }

        const x = centerX + Math.cos(s.angle) * s.distance;
        const y = centerY + Math.sin(s.angle) * s.distance;
        const trailX = x - Math.cos(s.angle + Math.PI / 2) * s.trailLength * Math.sign(s.speed);
        const trailY = y - Math.sin(s.angle + Math.PI / 2) * s.trailLength * Math.sign(s.speed);

        // Draw spark motion trail
        ctx.beginPath();
        ctx.moveTo(trailX, trailY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size;
        ctx.lineCap = 'round';
        ctx.globalAlpha = s.alpha * 0.8;
        ctx.stroke();

        // Hot white spark head
        ctx.beginPath();
        ctx.arc(x, y, s.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
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

        {/* Ring Group with Heat Shimmer Filter (desktop non-lite only) and Organic Wobble */}
        <g
          ref={ringRef}
          className={!isLite ? 'animate-portal-wobble' : ''}
          style={{
            filter: isShimmerAllowed ? 'url(#portal-heat-shimmer)' : undefined,
            transformOrigin: '300px 300px',
          }}
        >
          {/* Layer A: Dark Ember Outer Rim (Dark burgundy & ember foundation) */}
          <circle
            cx="300"
            cy="300"
            r="248"
            stroke="#450A0A"
            strokeWidth="9"
            strokeDasharray="220 50 140 60 180 40"
            strokeLinecap="round"
            strokeOpacity="0.8"
          />

          {/* Layer B: Outer Fiery Corona Arc 1: Clockwise fast (14s) */}
          <g className="animate-spell-spin" style={{ animationDuration: '14s', transformOrigin: '300px 300px' }}>
            <circle
              cx="300"
              cy="300"
              r="244"
              stroke="url(#sling-ring-gradient)"
              strokeWidth="6.5"
              strokeDasharray="180 50 90 40 140 60"
              strokeLinecap="round"
              strokeOpacity="0.88"
            />
            {/* Searing sparks on rim */}
            <circle cx="544" cy="300" r="4.5" fill="#FFFFFF" />
            <circle cx="300" cy="544" r="3.5" fill="#FFE5A3" />
            <circle cx="127" cy="127" r="3" fill="#F5B642" />
          </g>

          {/* Layer C: Inner Fiery Arc 2: Counter-Clockwise (10s) with varied thickness */}
          <g className="animate-spell-spin-reverse" style={{ animationDuration: '10s', transformOrigin: '300px 300px' }}>
            <circle
              cx="300"
              cy="300"
              r="239"
              stroke="url(#sling-ring-core)"
              strokeWidth="7"
              strokeDasharray="90 30 160 40 70 50"
              strokeLinecap="round"
              strokeOpacity="0.9"
            />
            <circle cx="300" cy="61" r="5" fill="#FFFFFF" />
            <circle cx="473" cy="473" r="3.5" fill="#FFE082" />
          </g>

          {/* Layer D: Searing Bright Hot White-Gold Core Edge: Irregular molten line (8s spin) */}
          <g className="animate-spell-spin" style={{ animationDuration: '8s', transformOrigin: '300px 300px' }}>
            <circle
              cx="300"
              cy="300"
              r="236"
              stroke="#FFE5A3"
              strokeWidth="4"
              strokeDasharray="120 30 180 25 70 35"
              strokeLinecap="round"
              strokeOpacity="0.92"
            />
            <circle
              cx="300"
              cy="300"
              r="235"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeDasharray="60 20 130 15 45 25"
              strokeLinecap="round"
              strokeOpacity="0.98"
            />
            <circle
              cx="300"
              cy="300"
              r="242"
              stroke="#FF7A1A"
              strokeWidth="10"
              strokeDasharray="30 140 50 110"
              strokeLinecap="round"
              strokeOpacity="0.65"
            />
          </g>

          {/* Deep Plasma Base Ring */}
          <circle
            cx="300"
            cy="300"
            r="236"
            stroke="#F5B642"
            strokeWidth="2"
            strokeOpacity="0.75"
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
