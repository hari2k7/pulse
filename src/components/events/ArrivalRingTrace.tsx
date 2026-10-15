import { useEffect, useState, type FC } from 'react';
import { useEffectsBudget } from '../../hooks/useEffectsBudget';

/**
 * Arrival Ring Trace Effect for /events
 * Only triggers when arriving by in-app navigation (not direct load, not POP, not reduced motion/lite).
 * A small ring traces the viewport edge and expands in ~600ms (transform/opacity).
 * Skippable, pointer-events-none (never delays content or input).
 */
export const ArrivalRingTrace: FC = () => {
  const budget = useEffectsBudget();
  const isLite = budget === 'lite';
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Guard: Reduced motion or lite budget
    if (isLite || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Guard: POP (back_forward) or reload navigation
    const navEntry = window.performance?.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming | undefined;
    if (navEntry && (navEntry.type === 'back_forward' || navEntry.type === 'reload')) {
      return;
    }

    // Guard: Direct URL load (must have visited within current session or came from same host)
    const hasSessionHistory = (() => {
      try {
        const active = sessionStorage.getItem('strange_app_session') === 'active';
        sessionStorage.setItem('strange_app_session', 'active');
        return active;
      } catch {
        return false;
      }
    })();

    const isInternalReferrer =
      typeof document !== 'undefined' &&
      Boolean(document.referrer && document.referrer.includes(window.location.host));

    if (!hasSessionHistory && !isInternalReferrer) {
      return;
    }

    // Trigger arrival ring expansion asynchronously
    const startTimer = setTimeout(() => {
      setIsActive(true);
    }, 0);

    const timer = setTimeout(() => {
      setIsActive(false);
    }, 650);

    const handleSkip = () => {
      setIsActive(false);
    };

    window.addEventListener('keydown', handleSkip, { once: true });
    window.addEventListener('click', handleSkip, { once: true });

    return () => {
      clearTimeout(startTimer);
      clearTimeout(timer);
      window.removeEventListener('keydown', handleSkip);
      window.removeEventListener('click', handleSkip);
    };
  }, [isLite]);

  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      {/* Searing Fiery Expanding Ring Vector */}
      <svg
        viewBox="0 0 1000 1000"
        className="w-full h-full max-w-[120vw] max-h-[120vh] animate-portal-arrival-expand"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="arrival-gold-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#FFE082" />
            <stop offset="70%" stopColor="#FF7A1A" />
            <stop offset="100%" stopColor="#D84315" />
          </linearGradient>
        </defs>

        <circle
          cx="500"
          cy="500"
          r="480"
          stroke="url(#arrival-gold-ring)"
          strokeWidth="6"
          strokeDasharray="200 60 400 80 150 50"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
        <circle
          cx="500"
          cy="500"
          r="470"
          stroke="#FFE5A3"
          strokeWidth="2.5"
          strokeDasharray="80 40 120 60"
          strokeOpacity="0.7"
        />
      </svg>
    </div>
  );
};
