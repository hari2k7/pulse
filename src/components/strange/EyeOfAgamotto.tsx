import { useEffect, useState, useRef, type FC } from 'react';
import { FESTIVAL_CONFIG } from '../../config/festival';

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
}

export interface EyeOfAgamottoProps {
  /** Optional fallback start ISO date string if festival.startDate is unset */
  fallbackDate?: string;
  className?: string;
}

/**
 * Calculates remaining time until target in IST (+05:30)
 */
function calculateTimeRemaining(targetDateStr: string): CountdownTime {
  const target = new Date(targetDateStr).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0 || isNaN(diff)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, isLive: false };
}

/**
 * Eye of Agamotto Artifact & Countdown Timer
 * Built as layered vector artwork with:
 * - 3 to 4 concentric rings rotating at differing speeds/directions (CSS transform only)
 * - Pulsing central emerald/gold temporal eye core
 * - Glyph orbital markers
 * - Days / Hours / Minutes / Seconds rendered as real text
 * - Accessible sr-only summary updated once per minute
 * - Pauses when tab is hidden or offscreen
 */
export const EyeOfAgamotto: FC<EyeOfAgamottoProps> = ({
  fallbackDate,
  className = '',
}) => {
  const targetDate = FESTIVAL_CONFIG.startDate || fallbackDate;
  const isFallback = !FESTIVAL_CONFIG.startDate && Boolean(fallbackDate);

  const [time, setTime] = useState<CountdownTime>(() =>
    targetDate ? calculateTimeRemaining(targetDate) : { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false }
  );

  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver to pause timer when offscreen
  useEffect(() => {
    if (!targetDate) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [targetDate]);

  // Timer loop with document visibility check
  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      if (document.hidden || !isVisible) return;
      setTime(calculateTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, isVisible]);

  // If no date at all, hide component per non-negotiable constraint 4
  if (!targetDate) {
    return null;
  }

  const srSummary = time.isLive
    ? 'Festival is currently live!'
    : `${time.days} days, ${time.hours} hours, ${time.minutes} minutes until ${
        isFallback ? 'next event' : 'festival starts'
      }.`;

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-xl bg-[#0D1020] border border-[#FF7A1A]/30 shadow-2xl overflow-hidden ${className}`}
    >
      {/* Screen reader announcement (polite, updated periodically, not every second) */}
      <div className="sr-only" aria-live="polite">
        {srSummary}
      </div>

      {/* Label */}
      <div className="mb-6">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-[#F5B642]">
          {isFallback ? 'Next Event In' : 'Festival Countdown'}
        </h2>
      </div>

      {/* The Eye of Agamotto Medallion Artwork */}
      <div className="relative w-44 h-44 sm:w-56 sm:h-56 mb-6 flex items-center justify-center select-none" aria-hidden="true">
        {/* Ambient mystic glow */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-r from-[#FF7A1A]/20 via-[#3DDC97]/25 to-[#F5B642]/20 blur-xl pointer-events-none" />

        <svg
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10"
        >
          {/* Ring 1 (Outer Ornate Shell): Slow Clockwise 45s */}
          <g className="animate-spell-spin" style={{ animationDuration: '45s', transformOrigin: 'center' }}>
            <circle cx="120" cy="120" r="112" stroke="#F5B642" strokeWidth="2" strokeOpacity="0.85" />
            <circle cx="120" cy="120" r="104" stroke="#FF7A1A" strokeWidth="1.2" strokeDasharray="3 5 8 5" strokeOpacity="0.7" />
            {/* Cardinal Relic Notches */}
            <circle cx="120" cy="8" r="3" fill="#F5B642" />
            <circle cx="120" cy="232" r="3" fill="#F5B642" />
            <circle cx="8" cy="120" r="3" fill="#F5B642" />
            <circle cx="232" cy="120" r="3" fill="#F5B642" />
          </g>

          {/* Ring 2 (Runic Glyph Band): Counter-Clockwise 30s */}
          <g className="animate-spell-spin-reverse" style={{ animationDuration: '30s', transformOrigin: 'center' }}>
            <circle cx="120" cy="120" r="88" stroke="#3DDC97" strokeWidth="1.5" strokeOpacity="0.65" />
            <polygon
              points="120,38 190,162 50,162"
              stroke="#F5B642"
              strokeWidth="1.2"
              strokeOpacity="0.5"
            />
            <polygon
              points="120,202 190,78 50,78"
              stroke="#F5B642"
              strokeWidth="1.2"
              strokeOpacity="0.5"
            />
          </g>

          {/* Ring 3 (Interlocking Aperture): Clockwise 18s */}
          <g className="animate-spell-spin" style={{ animationDuration: '18s', transformOrigin: 'center' }}>
            <circle cx="120" cy="120" r="62" stroke="#FF7A1A" strokeWidth="2" strokeOpacity="0.9" />
            <path
              d="M120 58 Q145 95 182 120 Q145 145 120 182 Q95 145 58 120 Q95 95 120 58 Z"
              stroke="#3DDC97"
              strokeWidth="1.5"
              fill="none"
              strokeOpacity="0.75"
            />
          </g>

          {/* Center Eye Aperture: Time Stone Emerald Glow */}
          <g className="animate-portal-pulse" style={{ transformOrigin: 'center' }}>
            <ellipse cx="120" cy="120" rx="36" ry="24" fill="#07060D" stroke="#3DDC97" strokeWidth="2.5" />
            <circle cx="120" cy="120" r="14" fill="#3DDC97" fillOpacity="0.3" stroke="#F5B642" strokeWidth="1.5" />
            <circle cx="120" cy="120" r="6" fill="#3DDC97" />
            <circle cx="120" cy="120" r="2" fill="#FFFFFF" />
          </g>
        </svg>
      </div>

      {/* Countdown Values or Live State */}
      {time.isLive ? (
        <div className="py-2 px-6 rounded-full bg-[#3DDC97]/20 border border-[#3DDC97] text-[#3DDC97] font-display text-lg tracking-widest uppercase">
          Festival is Live
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full max-w-sm" aria-hidden="true">
          {[
            { label: 'Days', val: time.days },
            { label: 'Hours', val: time.hours },
            { label: 'Mins', val: time.minutes },
            { label: 'Secs', val: time.seconds },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-[#07060D]/80 border border-[#FF7A1A]/20"
            >
              <span className="font-display font-bold text-2xl sm:text-3xl text-[#F3EFE8] leading-none">
                {String(item.val).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#B8B3C7] mt-1">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
