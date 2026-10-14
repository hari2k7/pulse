import { useEffect, useRef, type FC } from 'react';

export interface SlingRingPortalProps {
  className?: string;
  size?: number;
}

/**
 * Sling Ring Portal Artwork
 * Pure inline SVG concentric fiery rings + subtle CSS rotation.
 * Canvas particles initialized via requestIdleCallback (Constraint 5),
 * paused when tab hidden or offscreen, disabled for prefers-reduced-motion.
 */
export const SlingRingPortal: FC<SlingRingPortalProps> = ({
  className = '',
  size = 560,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Capped particle count: reduced on mobile (< 768px: 18 particles, desktop: 36 particles)
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 18 : 36;
    const radius = Math.min(width, height) * 0.38;
    const centerX = width / 2;
    const centerY = height / 2;

    interface Particle {
      angle: number;
      speed: number;
      distance: number;
      radialSpeed: number;
      size: number;
      alpha: number;
      color: string;
    }

    const colors = ['#FF7A1A', '#F5B642', '#FFE5A3', '#FF4500'];

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: (0.01 + Math.random() * 0.02) * (Math.random() > 0.5 ? 1 : -1),
      distance: radius + (Math.random() * 20 - 10),
      radialSpeed: Math.random() * 0.8 - 0.4,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.8 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    // IntersectionObserver to pause when offscreen
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

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.speed;
        p.distance += p.radialSpeed;

        // Reset if drifted too far from the perimeter
        if (Math.abs(p.distance - radius) > 35) {
          p.distance = radius + (Math.random() * 10 - 5);
          p.radialSpeed = Math.random() * 0.8 - 0.4;
        }

        const x = centerX + Math.cos(p.angle) * p.distance;
        const y = centerY + Math.sin(p.angle) * p.distance;

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    };

    // Initialize via requestIdleCallback after first paint per Constraint 5
    let idleHandle: number;
    if ('requestIdleCallback' in window) {
      idleHandle = window.requestIdleCallback(() => {
        animationFrameId = requestAnimationFrame(render);
      });
    } else {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if ('cancelIdleCallback' in window && idleHandle) {
        window.cancelIdleCallback(idleHandle);
      }
      window.removeEventListener('resize', handleResize);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Layer 1: Ambient Radial & Conic Backdrop Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF7A1A]/20 via-[#F5B642]/15 to-[#C8102E]/10 blur-3xl pointer-events-none" />

      {/* Layer 2: Vector Sling Ring Rotating Geometry */}
      <svg
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10"
      >
        <defs>
          <linearGradient id="portal-gold-orange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="40%" stopColor="#F5B642" />
            <stop offset="80%" stopColor="#FF7A1A" />
            <stop offset="100%" stopColor="#E65100" />
          </linearGradient>
        </defs>

        {/* Outer Ring: Slow Clockwise Spin (36s) */}
        <g className="animate-spell-spin" style={{ animationDuration: '36s', transformOrigin: 'center' }}>
          <circle cx="300" cy="300" r="270" stroke="url(#portal-gold-orange)" strokeWidth="2.5" strokeOpacity="0.8" />
          <circle cx="300" cy="300" r="260" stroke="#FF7A1A" strokeWidth="1.5" strokeDasharray="3 6 12 6" strokeOpacity="0.75" />
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={i}
              x1="300"
              y1="34"
              x2="300"
              y2="46"
              stroke="#F5B642"
              strokeWidth="1.5"
              strokeOpacity="0.85"
              transform={`rotate(${(i * 360) / 24} 300 300)`}
            />
          ))}
        </g>

        {/* Middle Ring: Counter-Clockwise Runes (22s) */}
        <g className="animate-spell-spin-reverse" style={{ animationDuration: '22s', transformOrigin: 'center' }}>
          <circle cx="300" cy="300" r="230" stroke="#F5B642" strokeWidth="2" strokeOpacity="0.65" />
          <polygon
            points="300,75 490,400 110,400"
            stroke="#FF7A1A"
            strokeWidth="1.2"
            strokeOpacity="0.5"
          />
          <polygon
            points="300,525 490,200 110,200"
            stroke="#FF7A1A"
            strokeWidth="1.2"
            strokeOpacity="0.5"
          />
          <circle cx="300" cy="300" r="200" stroke="#FFE082" strokeWidth="1" strokeDasharray="4 8" strokeOpacity="0.7" />
        </g>

        {/* Inner Ring: Fiery Sling Ring Aperture */}
        <g className="animate-portal-pulse" style={{ transformOrigin: 'center' }}>
          <circle cx="300" cy="300" r="160" stroke="url(#portal-gold-orange)" strokeWidth="3" strokeOpacity="0.9" />
          <circle cx="300" cy="300" r="150" stroke="#FF7A1A" strokeWidth="1.5" strokeDasharray="2 4" strokeOpacity="0.8" />
          {/* Deep void opening inside the portal */}
          <circle cx="300" cy="300" r="140" fill="#07060D" fillOpacity="0.75" />
        </g>
      </svg>

      {/* Layer 3: Dynamic Canvas Sparks (Rendered on top of vector portal) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
      />
    </div>
  );
};
