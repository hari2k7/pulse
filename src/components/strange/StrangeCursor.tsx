import { useEffect, useRef, useState, type FC } from 'react';

interface RuneItem {
  x: number;
  y: number;
  alpha: number;
  glyph: number;
  active: boolean;
}

const MAX_RUNES = 8;

export const StrangeCursor: FC = () => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [isInteractive, setIsInteractive] = useState<boolean>(false);

  // References for transform/opacity hardware-accelerated nodes
  const coreRef = useRef<HTMLDivElement>(null);
  const mandalaRef = useRef<HTMLDivElement>(null);
  const rippleNodeRef = useRef<HTMLDivElement>(null);
  const runeElementsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Smooth lerp coordinates
  const posRef = useRef({
    currentX: -100,
    currentY: -100,
    targetX: -100,
    targetY: -100,
    lastSpawnX: -100,
    lastSpawnY: -100,
  });

  // Click ripple state
  const rippleStateRef = useRef({
    x: 0,
    y: 0,
    scale: 0.3,
    alpha: 0,
    active: false,
  });

  // Pooled trailing rune glyphs (max 8 elements)
  const runesPoolRef = useRef<RuneItem[]>(
    Array.from({ length: MAX_RUNES }, () => ({
      x: -100,
      y: -100,
      alpha: 0,
      glyph: 0,
      active: false,
    }))
  );
  const poolIndexRef = useRef<number>(0);

  // Lazy-load after first paint & verify pointer/motion capability
  useEffect(() => {
    const evaluateCapabilities = () => {
      const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setEnabled(finePointer && !reducedMotion);
    };

    // Lazy load after paint
    const checkTimer = window.setTimeout(() => {
      requestAnimationFrame(evaluateCapabilities);
    }, 60);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

    const handleChange = () => evaluateCapabilities();
    motionQuery.addEventListener('change', handleChange);
    pointerQuery.addEventListener('change', handleChange);

    return () => {
      window.clearTimeout(checkTimer);
      motionQuery.removeEventListener('change', handleChange);
      pointerQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Main rAF animation & event management
  useEffect(() => {
    if (!enabled) return;

    let animId: number;

    const handlePointerMove = (e: PointerEvent) => {
      posRef.current.targetX = e.clientX;
      posRef.current.targetY = e.clientY;

      // Spawn a trailing rune if moved at least 28px from last position
      const dx = e.clientX - posRef.current.lastSpawnX;
      const dy = e.clientY - posRef.current.lastSpawnY;
      if (dx * dx + dy * dy > 784) {
        posRef.current.lastSpawnX = e.clientX;
        posRef.current.lastSpawnY = e.clientY;

        const idx = poolIndexRef.current;
        const rune = runesPoolRef.current[idx];
        rune.x = e.clientX;
        rune.y = e.clientY;
        rune.alpha = 0.75;
        rune.glyph = Math.floor(Math.random() * 4);
        rune.active = true;

        poolIndexRef.current = (idx + 1) % MAX_RUNES;
      }

      // Check if over interactive elements (buttons, links, cards)
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = !!target.closest(
          'a, button, [role="button"], input, select, textarea, .card-strange, [data-interactive="true"]'
        );
        setIsInteractive(interactive);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      rippleStateRef.current = {
        x: e.clientX,
        y: e.clientY,
        scale: 0.35,
        alpha: 0.9,
        active: true,
      };
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    // Single rAF loop for transform/opacity updates only
    const render = () => {
      const pos = posRef.current;
      pos.currentX += (pos.targetX - pos.currentX) * 0.4;
      pos.currentY += (pos.targetY - pos.currentY) * 0.4;

      // 1. Core rotating spell circle position
      if (coreRef.current) {
        coreRef.current.style.transform = `translate3d(${pos.currentX}px, ${pos.currentY}px, 0)`;
      }

      // 2. Mandala sigil position (expands on interactive)
      if (mandalaRef.current) {
        mandalaRef.current.style.transform = `translate3d(${pos.currentX}px, ${pos.currentY}px, 0)`;
      }

      // 3. Click ripple animation (ring expands and fades)
      const ripple = rippleStateRef.current;
      if (ripple.active && rippleNodeRef.current) {
        ripple.scale += 0.08;
        ripple.alpha -= 0.04;

        if (ripple.alpha <= 0 || ripple.scale > 1.8) {
          ripple.active = false;
          rippleNodeRef.current.style.opacity = '0';
        } else {
          rippleNodeRef.current.style.transform = `translate3d(${ripple.x}px, ${ripple.y}px, 0) scale(${ripple.scale})`;
          rippleNodeRef.current.style.opacity = String(ripple.alpha);
        }
      }

      // 4. Trailing runes update (transform/opacity only)
      const pool = runesPoolRef.current;
      for (let i = 0; i < MAX_RUNES; i++) {
        const rune = pool[i];
        const el = runeElementsRef.current[i];
        if (!el) continue;

        if (rune.active) {
          rune.alpha -= 0.025;
          if (rune.alpha <= 0) {
            rune.active = false;
            el.style.opacity = '0';
          } else {
            el.style.transform = `translate3d(${rune.x}px, ${rune.y}px, 0)`;
            el.style.opacity = String(rune.alpha);
          }
        }
      }

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
      {/* 1. Small orange/gold spell circle (thin double ring with tiny runes and tick marks, slowly rotating) */}
      <div
        ref={coreRef}
        className="absolute top-0 left-0 w-7 h-7 -ml-3.5 -mt-3.5 will-change-transform"
      >
        <svg
          viewBox="0 0 28 28"
          fill="none"
          className="w-full h-full animate-core-cw opacity-85"
        >
          {/* Outer thin ring */}
          <circle cx="14" cy="14" r="12" stroke="#FF7A1A" strokeWidth="1" />
          {/* Inner concentric ring with dashed runes */}
          <circle cx="14" cy="14" r="9" stroke="#F5B642" strokeWidth="0.8" strokeDasharray="3 2" />
          {/* Cardinal tick marks */}
          <line x1="14" y1="0.5" x2="14" y2="3.5" stroke="#F5B642" strokeWidth="1" />
          <line x1="14" y1="24.5" x2="14" y2="27.5" stroke="#F5B642" strokeWidth="1" />
          <line x1="0.5" y1="14" x2="3.5" y2="14" stroke="#F5B642" strokeWidth="1" />
          <line x1="24.5" y1="14" x2="27.5" y2="14" stroke="#F5B642" strokeWidth="1" />
          {/* Central geometric rune node */}
          <rect x="12" y="12" width="4" height="4" transform="rotate(45 14 14)" fill="#FF7A1A" opacity="0.9" />
        </svg>
      </div>

      {/* 2. Expanded Mandala Sigil (over buttons, links, cards; rings rotating in opposite directions) */}
      <div
        ref={mandalaRef}
        className={`absolute top-0 left-0 w-16 h-16 -ml-8 -mt-8 will-change-transform transition-all duration-300 ${
          isInteractive ? 'scale-100 opacity-90' : 'scale-0 opacity-0'
        }`}
      >
        <div className="relative w-full h-full">
          {/* Outer Layer: Clockwise rotating ring with runes & tick marks */}
          <svg
            viewBox="0 0 64 64"
            fill="none"
            className="absolute inset-0 w-full h-full animate-sigil-cw"
          >
            {/* Outer perimeter double ring */}
            <circle cx="32" cy="32" r="30" stroke="#FF7A1A" strokeWidth="1" />
            <circle cx="32" cy="32" r="27" stroke="#F5B642" strokeWidth="0.8" strokeDasharray="4 2.5" />
            {/* 8 Geometric tick runes */}
            <path d="M32 0 L34 4 L30 4 Z" fill="#F5B642" />
            <path d="M32 64 L34 60 L30 60 Z" fill="#F5B642" />
            <path d="M0 32 L4 34 L4 30 Z" fill="#F5B642" />
            <path d="M64 32 L60 34 L60 30 Z" fill="#F5B642" />
            <circle cx="10" cy="10" r="1.5" fill="#FF7A1A" />
            <circle cx="54" cy="10" r="1.5" fill="#FF7A1A" />
            <circle cx="10" cy="54" r="1.5" fill="#FF7A1A" />
            <circle cx="54" cy="54" r="1.5" fill="#FF7A1A" />
          </svg>

          {/* Inner Layer: Counter-clockwise rotating geometric star & inner rune marks */}
          <svg
            viewBox="0 0 64 64"
            fill="none"
            className="absolute inset-0 w-full h-full animate-sigil-ccw"
          >
            {/* Intersecting 8-pointed geometric star */}
            <rect x="17" y="17" width="30" height="30" stroke="#F5B642" strokeWidth="0.8" opacity="0.8" />
            <rect x="17" y="17" width="30" height="30" transform="rotate(45 32 32)" stroke="#FF7A1A" strokeWidth="0.8" opacity="0.8" />
            {/* Mid ring */}
            <circle cx="32" cy="32" r="21" stroke="#F5B642" strokeWidth="0.7" strokeDasharray="2 3" />
            <circle cx="32" cy="32" r="12" stroke="#FF7A1A" strokeWidth="0.8" />
          </svg>
        </div>
      </div>

      {/* 3. Click Spell-Circle Ripple Ring */}
      <div
        ref={rippleNodeRef}
        className="absolute top-0 left-0 w-16 h-16 -ml-8 -mt-8 will-change-transform opacity-0"
      >
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          <circle cx="32" cy="32" r="28" stroke="#F5B642" strokeWidth="1.2" strokeDasharray="5 3" />
          <circle cx="32" cy="32" r="22" stroke="#FF7A1A" strokeWidth="0.8" />
        </svg>
      </div>

      {/* 4. Pooled tiny rune glyphs (max 8 elements) that briefly fade near pointer while moving */}
      {Array.from({ length: MAX_RUNES }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            runeElementsRef.current[i] = el;
          }}
          className="absolute top-0 left-0 w-3.5 h-3.5 -ml-[7px] -mt-[7px] will-change-transform opacity-0"
        >
          <svg viewBox="0 0 14 14" fill="none" className="w-full h-full">
            {i % 4 === 0 && (
              /* Diamond with central cross */
              <path d="M7 1 L13 7 L7 13 L1 7 Z M7 4 L7 10 M4 7 L10 7" stroke="#F5B642" strokeWidth="0.9" />
            )}
            {i % 4 === 1 && (
              /* Concentric ring with equilateral triangle */
              <>
                <circle cx="7" cy="7" r="6" stroke="#FF7A1A" strokeWidth="0.8" />
                <polygon points="7,3 11,10 3,10" stroke="#F5B642" strokeWidth="0.75" />
              </>
            )}
            {i % 4 === 2 && (
              /* Octagonal rune node with bisector */
              <>
                <polygon points="5,1 9,1 13,5 13,9 9,13 5,13 1,9 1,5" stroke="#F5B642" strokeWidth="0.8" />
                <line x1="7" y1="2" x2="7" y2="12" stroke="#FF7A1A" strokeWidth="0.75" />
              </>
            )}
            {i % 4 === 3 && (
              /* Alchemical square & circle sigil */
              <>
                <rect x="3" y="3" width="8" height="8" stroke="#FF7A1A" strokeWidth="0.8" />
                <circle cx="7" cy="7" r="3" stroke="#F5B642" strokeWidth="0.75" />
              </>
            )}
          </svg>
        </div>
      ))}
    </div>
  );
};
