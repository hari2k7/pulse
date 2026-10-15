import { useEffect, useRef, useState, type FC } from 'react';
import { useEffectsBudget } from '../../hooks/useEffectsBudget';

interface NoteItem {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  alpha: number;
  color: string;
  type: number; // 0: single eighth note, 1: beamed pair, 2: quarter note
  size: number;
  active: boolean;
}

const MAX_NOTES = 10;
const NOTE_COLORS = ['#FF7A1A', '#F5B642'];

export const StrangeCursor: FC = () => {
  const budget = useEffectsBudget();
  const isLite = budget === 'lite';
  const [enabled, setEnabled] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isOnInput, setIsOnInput] = useState<boolean>(false);
  const [isInteractive, setIsInteractive] = useState<boolean>(false);
  const [isDown, setIsDown] = useState<boolean>(false);

  // References for transform/opacity hardware-accelerated nodes
  const diamondRef = useRef<HTMLDivElement>(null);
  const noteElementsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Smooth coordinates (1-frame direct follow for zero lag)
  const posRef = useRef({
    currentX: -100,
    currentY: -100,
    targetX: -100,
    targetY: -100,
    lastSpawnX: -100,
    lastSpawnY: -100,
  });

  // Pooled music notes (max 10 reused elements)
  const notesPoolRef = useRef<NoteItem[]>(
    Array.from({ length: MAX_NOTES }, () => ({
      x: -100,
      y: -100,
      vx: 0,
      vy: 0,
      rot: 0,
      rotSpeed: 0,
      alpha: 0,
      color: NOTE_COLORS[0],
      type: 0,
      size: 16,
      active: false,
    }))
  );
  const poolIndexRef = useRef<number>(0);
  const colorIndexRef = useRef<number>(0);

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
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, []);

  // Main rAF animation, native cursor suppression & event management
  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove('has-custom-cursor');
      return;
    }

    // Apply has-custom-cursor to <html> when mounted & capable
    document.documentElement.classList.add('has-custom-cursor');

    let animId: number;

    const spawnNote = (
      x: number,
      y: number,
      vx = (Math.random() - 0.5) * 0.9,
      vy = -(Math.random() * 0.6 + 0.8)
    ) => {
      if (isLite) return;
      const idx = poolIndexRef.current;
      const note = notesPoolRef.current[idx];
      note.x = x;
      note.y = y;
      note.vx = vx;
      note.vy = vy;
      note.rot = (Math.random() - 0.5) * 20;
      note.rotSpeed = (Math.random() - 0.5) * 0.8;
      note.alpha = 1;
      note.color = NOTE_COLORS[colorIndexRef.current % NOTE_COLORS.length];
      colorIndexRef.current += 1;
      note.type = Math.floor(Math.random() * 3);
      note.size = Math.floor(Math.random() * 5) + 14; // 14px to 18px
      note.active = true;

      poolIndexRef.current = (idx + 1) % MAX_NOTES;
    };

    const recomputeZone = (clientX?: number, clientY?: number, explicitTarget?: Element | null) => {
      let target = explicitTarget;
      const x = clientX ?? posRef.current.targetX;
      const y = clientY ?? posRef.current.targetY;
      if (!target && typeof document !== 'undefined' && document.elementFromPoint && x > 0 && y > 0) {
        target = document.elementFromPoint(x, y);
      }
      const isNative = !!target?.closest(
        'input, textarea, select, [contenteditable="true"], [data-native-cursor]'
      );
      setIsOnInput(isNative);

      const interactive =
        !isNative &&
        !!target?.closest(
          'a, button, [role="button"], label, summary, .card-strange, [data-interactive="true"]'
        );
      setIsInteractive(interactive);
    };

    const handlePointerMove = (e: PointerEvent) => {
      posRef.current.targetX = e.clientX;
      posRef.current.targetY = e.clientY;
      setIsVisible(true);
      document.documentElement.classList.add('has-custom-cursor');

      // Spawn one note every ~45px of movement (never when still)
      const dx = e.clientX - posRef.current.lastSpawnX;
      const dy = e.clientY - posRef.current.lastSpawnY;
      if (dx * dx + dy * dy >= 2025) {
        // 45^2 = 2025
        posRef.current.lastSpawnX = e.clientX;
        posRef.current.lastSpawnY = e.clientY;
        spawnNote(e.clientX, e.clientY);
      }

      // Compute native zone on every pointermove
      const target = e.target as Element | null;
      recomputeZone(e.clientX, e.clientY, target);
    };

    const handlePointerDown = (e: PointerEvent) => {
      setIsDown(true);
      if (isLite) return;

      // Click: a burst of 3 to 4 notes flying outward and fading
      const burstCount = Math.floor(Math.random() * 2) + 3; // 3 or 4
      for (let i = 0; i < burstCount; i++) {
        const angle = (i * (Math.PI * 2)) / burstCount + (Math.random() - 0.5) * 0.4;
        const speed = Math.random() * 1.5 + 1.2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed - 0.6; // drift slightly upward
        spawnNote(e.clientX, e.clientY, vx, vy);
      }
    };

    const handlePointerUp = () => {
      setIsDown(false);
    };

    // Remove custom cursor styling and hide diamond when pointer leaves document or window blurs
    const handleMouseLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        document.documentElement.classList.remove('has-custom-cursor');
        setIsVisible(false);
      }
    };

    const handleMouseEnter = () => {
      document.documentElement.classList.add('has-custom-cursor');
      setIsVisible(true);
    };

    const handleWindowBlur = () => {
      document.documentElement.classList.remove('has-custom-cursor');
      setIsVisible(false);
    };

    const handleWindowFocus = () => {
      document.documentElement.classList.add('has-custom-cursor');
      setIsVisible(true);
      recomputeZone();
    };

    const handleRecompute = () => {
      recomputeZone();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mousemove', handlePointerMove as unknown as EventListener, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('change', handleRecompute, { capture: true, passive: true });
    document.addEventListener('focusout', handleRecompute, { capture: true, passive: true });

    // Single rAF loop: diamond updates within 1 frame (zero lerp lag)
    const render = () => {
      const pos = posRef.current;
      pos.currentX = pos.targetX;
      pos.currentY = pos.targetY;

      // 1. Diamond cursor position (follows within ~1 frame, perfectly centered)
      if (diamondRef.current) {
        diamondRef.current.style.transform = `translate3d(${pos.currentX}px, ${pos.currentY}px, 0)`;
      }

      // 2. Trailing music notes update (drifts up & sideways, fades over ~900ms)
      if (!isLite) {
        const pool = notesPoolRef.current;
        for (let i = 0; i < MAX_NOTES; i++) {
          const note = pool[i];
          const el = noteElementsRef.current[i];
          if (!el) continue;

          if (note.active) {
            note.x += note.vx;
            note.y += note.vy;
            note.rot += note.rotSpeed;
            note.alpha -= 0.018; // ~900ms at 60fps (54 frames)

            if (note.alpha <= 0) {
              note.active = false;
              el.style.opacity = '0';
            } else {
              el.style.transform = `translate3d(${note.x}px, ${note.y}px, 0) rotate(${note.rot}deg) scale(${note.size / 16})`;
              el.style.opacity = String(note.alpha);
              el.style.color = note.color;
            }
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
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousemove', handlePointerMove as unknown as EventListener);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('change', handleRecompute, { capture: true });
      document.removeEventListener('focusout', handleRecompute, { capture: true });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, isLite]);

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Small Diamond: roughly 10px square rotated 45deg, gold/orange fill with lighter outline */}
      <div
        ref={diamondRef}
        className="custom-diamond-cursor absolute top-0 left-0 w-0 h-0 will-change-transform"
        style={{
          opacity: isVisible && !isOnInput ? 1 : 0,
          transition: 'opacity 150ms ease-out',
        }}
      >
        <div
          className={`w-2.5 h-2.5 -ml-[5px] -mt-[5px] bg-[#FF7A1A] border border-[#FCE881] shadow-[0_0_8px_rgba(255,122,26,0.65)] transition-transform duration-200 ease-out ${
            isDown
              ? 'scale-75 rotate-[45deg]'
              : isInteractive
              ? 'scale-[1.8] rotate-[65deg]'
              : 'scale-100 rotate-[45deg]'
          }`}
        />
      </div>

      {/* 2. Pooled music notes: 10 reused DOM elements emitting SVG shapes */}
      {!isLite &&
        Array.from({ length: MAX_NOTES }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            noteElementsRef.current[i] = el;
          }}
          className="absolute top-0 left-0 w-4 h-4 -ml-2 -mt-2 will-change-transform opacity-0 pointer-events-none"
        >
          {i % 3 === 0 && (
            /* Single eighth note */
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full drop-shadow-[0_0_4px_currentColor]"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          )}
          {i % 3 === 1 && (
            /* Beamed pair */
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full drop-shadow-[0_0_4px_currentColor]"
            >
              <path d="M10 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V5l8-2v8.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V1L10 3z" />
            </svg>
          )}
          {i % 3 === 2 && (
            /* Quarter note */
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full drop-shadow-[0_0_4px_currentColor]"
            >
              <ellipse cx="9" cy="17" rx="4" ry="3" transform="rotate(-25 9 17)" />
              <rect x="11.5" y="4" width="2" height="13" />
            </svg>
          )}
        </div>
        ))}
    </div>
  );
};
