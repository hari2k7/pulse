import { useEffect, useRef, useState, type FC } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  vx: number;
  vy: number;
  color: string;
  active: boolean;
}

const MAX_PARTICLES = 20;
const COLORS = ['#FF7A1A', '#F5B642', '#FFA04D'];

export const StrangeCursor: FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Position references (avoid React re-renders in rAF loop)
  const posRef = useRef({
    currentX: -100,
    currentY: -100,
    targetX: -100,
    targetY: -100,
  });

  // Click ripple state
  const rippleRef = useRef<{
    x: number;
    y: number;
    radius: number;
    alpha: number;
    active: boolean;
  }>({
    x: 0,
    y: 0,
    radius: 0,
    alpha: 0,
    active: false,
  });

  // Pooled particle trail
  const particlesRef = useRef<Particle[]>(
    Array.from({ length: MAX_PARTICLES }, () => ({
      x: 0,
      y: 0,
      size: 2,
      alpha: 0,
      vx: 0,
      vy: 0,
      color: COLORS[0],
      active: false,
    }))
  );
  const poolIndexRef = useRef(0);

  // Check hardware capability: fine pointer, hover capable, no reduced motion
  useEffect(() => {
    const checkCapability = () => {
      const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setEnabled(finePointer && !reducedMotion);
    };

    checkCapability();

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

    const handler = () => checkCapability();
    motionQuery.addEventListener('change', handler);
    pointerQuery.addEventListener('change', handler);

    return () => {
      motionQuery.removeEventListener('change', handler);
      pointerQuery.removeEventListener('change', handler);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    // Handle canvas sizing
    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Pointer move listener
    const handlePointerMove = (e: PointerEvent) => {
      posRef.current.targetX = e.clientX;
      posRef.current.targetY = e.clientY;

      // Spawn a particle from pool every pointermove
      const pool = particlesRef.current;
      const idx = poolIndexRef.current;
      const p = pool[idx];
      p.x = e.clientX;
      p.y = e.clientY;
      p.size = Math.random() * 2.5 + 1.5;
      p.alpha = 0.8;
      p.vx = (Math.random() - 0.5) * 0.8;
      p.vy = (Math.random() - 0.5) * 0.8 + 0.3;
      p.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      p.active = true;

      poolIndexRef.current = (idx + 1) % MAX_PARTICLES;

      // Check if hovering interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = !!target.closest(
          'a, button, [role="button"], input, select, textarea, [data-interactive="true"]'
        );
        setIsInteractive(interactive);
      }
    };

    // Click ripple listener
    const handlePointerDown = (e: PointerEvent) => {
      rippleRef.current = {
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        alpha: 0.8,
        active: true,
      };
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    // Single requestAnimationFrame loop
    const render = () => {
      // Lerp cursor position
      const pos = posRef.current;
      pos.currentX += (pos.targetX - pos.currentX) * 0.35;
      pos.currentY += (pos.targetY - pos.currentY) * 0.35;

      // Update dot transform
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.currentX}px, ${pos.currentY}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${pos.currentX}px, ${pos.currentY}px, 0)`;
      }

      // Draw particle trail & ripple on canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update & draw particles
      const pool = particlesRef.current;
      for (let i = 0; i < MAX_PARTICLES; i++) {
        const p = pool[i];
        if (!p.active) continue;

        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.04;

        if (p.alpha <= 0) {
          p.active = false;
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Update & draw click ripple
      const ripple = rippleRef.current;
      if (ripple.active) {
        ripple.radius += 2.2;
        ripple.alpha -= 0.04;

        if (ripple.alpha <= 0 || ripple.radius > 36) {
          ripple.active = false;
        } else {
          ctx.save();
          ctx.globalAlpha = ripple.alpha;
          ctx.strokeStyle = '#F5B642';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Pause rendering if tab hidden
      if (!document.hidden) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        cancelAnimationFrame(animId);
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Lightweight 2D canvas for particle trail & click ripple */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Small Glowing Orange/Gold Dot */}
      <div
        ref={dotRef}
        className="absolute top-0 left-0 w-2.5 h-2.5 -ml-[5px] -mt-[5px] rounded-full bg-gradient-to-r from-[#FF7A1A] to-[#F5B642] shadow-[0_0_8px_#FF7A1A] will-change-transform"
      />

      {/* Delicate Spell Glyph Ring on Interactive Hover */}
      <div
        ref={ringRef}
        className={`absolute top-0 left-0 w-8 h-8 -ml-4 -mt-4 rounded-full border border-[#F5B642]/60 transition-all duration-200 will-change-transform flex items-center justify-center ${
          isInteractive
            ? 'scale-100 opacity-90 animate-[spin_8s_linear_infinite]'
            : 'scale-0 opacity-0'
        }`}
      >
        <span className="w-1 h-1 rounded-full bg-[#FF7A1A] absolute -top-0.5" />
        <span className="w-1 h-1 rounded-full bg-[#FF7A1A] absolute -bottom-0.5" />
      </div>
    </div>
  );
};
