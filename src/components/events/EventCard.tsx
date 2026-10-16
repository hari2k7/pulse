import { useState, useMemo, type FC, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePrefetchEvent } from '../../hooks/useEvents';
import {
  getOptimizedImageUrl,
  getImageSrcSet,
  FALLBACK_IMAGE_DATA_URI,
} from '../../lib/images';
import { formatDateIST } from '../../lib/format';
import { useFavorites } from '../../lib/favorites';
import { realmOf } from '../../lib/realms';
import type { EventSummary } from '../../lib/types';

export interface EventCardProps {
  event: Partial<EventSummary> & { id: string };
  priority?: boolean;
  className?: string;
}

/**
 * Stage 3: Shared Cinematic EventCard
 * - Cinematic treatment: image fills top with dark lower fade
 * - Title, type line (above title), date, and plain registration status tag
 * - Uniform size, single slots-left pill on image
 * - CTA label is strictly "ENTER DIMENSION" (styled span, no arrow) for every status
 * - Heart is a sibling of the Link (no accidental clicks, no overlap at 375px)
 * - Hover/focus: image zooms slightly, gold corner details illuminate, card lifts, cloak peel + portal reveal
 * - Click: realm-tinted expanding ring forms around image and expands (<=600ms) with View Transition
 */
export const EventCard: FC<EventCardProps> = ({
  event,
  priority = false,
  className = '',
}) => {
  const navigate = useNavigate();
  const { handlers } = usePrefetchEvent(event.id);
  const [imageFailed, setImageFailed] = useState<boolean>(false);
  const [isExpanding, setIsExpanding] = useState<boolean>(false);

  const rawImageUrl = event.cover_image_url;
  const hasValidImage = Boolean(rawImageUrl && !imageFailed);
  const optimizedUrl = hasValidImage
    ? getOptimizedImageUrl(rawImageUrl, 600, 400)
    : FALLBACK_IMAGE_DATA_URI;
  const srcSet = hasValidImage
    ? getImageSrcSet(rawImageUrl, [320, 440, 600], 2 / 3)
    : undefined;

  const title = event.name || 'Event Dimension';
  const category = event.category;
  const blurb =
    event.blurb || 'Discover event guidelines, schedules, rules, and entry specifications.';
  const dateFormatted = formatDateIST(event.schedule_summary);
  const hasDate = Boolean(dateFormatted && dateFormatted !== 'TBA');

  // Realm derivation for accent tinting & View Transition
  const realm = useMemo(() => realmOf(event), [event]);

  // Seats calculation & slot badge text
  const hasSlotData =
    typeof event.total_seats === 'number' && typeof event.seats_filled === 'number';
  const remainingSlots = hasSlotData
    ? Math.max(0, (event.total_seats as number) - (event.seats_filled as number))
    : null;

  const isCompleted = event.event_status === 'COMPLETED';
  const isSoldOut =
    event.registration_status === 'SOLD_OUT' || (hasSlotData && remainingSlots === 0);

  let slotBadgeText: string | null = null;
  if (!isCompleted) {
    if (isSoldOut) {
      slotBadgeText = 'SOLD OUT';
    } else if (hasSlotData && remainingSlots !== null) {
      if (remainingSlots <= 5) {
        slotBadgeText = `ONLY ${remainingSlots} LEFT`;
      } else {
        const unit = event.is_per_head === false ? 'TEAM SLOTS' : 'SLOTS';
        slotBadgeText = `${remainingSlots} ${unit} LEFT`;
      }
    }
  }

  // Plain Registration Status Tag Text (Strictly text, no invented badges)
  const statusTagText = useMemo(() => {
    if (isCompleted) return 'Completed';
    if (isSoldOut) return 'Sold out';
    if (event.registration_status === 'OPEN') return 'Registration open';
    return 'Registration closed';
  }, [isCompleted, isSoldOut, event.registration_status]);

  const statusTagColor = useMemo(() => {
    if (isCompleted) return 'text-[#B8B3C7] border-white/20 bg-white/5';
    if (isSoldOut) return 'text-[#EF4444] border-[#EF4444]/40 bg-[#EF4444]/10';
    if (event.registration_status === 'OPEN') return 'text-[#3DDC97] border-[#3DDC97]/40 bg-[#3DDC97]/10';
    return 'text-[#B8B3C7] border-white/20 bg-white/5';
  }, [isCompleted, isSoldOut, event.registration_status]);

  // Team Size helper from min/max_teamsize
  const teamSizeText = useMemo(() => {
    if (typeof event.min_teamsize === 'number' && typeof event.max_teamsize === 'number') {
      if (event.min_teamsize === event.max_teamsize) {
        return event.min_teamsize === 1 ? '1 Person' : `${event.min_teamsize} Members`;
      }
      return `${event.min_teamsize}–${event.max_teamsize} Members`;
    }
    return null;
  }, [event.min_teamsize, event.max_teamsize]);

  // Pricing display
  const isFree =
    event.price === 0 || event.price === null || event.price === undefined;
  const isPerHead = event.is_per_head !== false;

  // View Transition navigation with expanding realm-tinted ring
  const handleCardClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetUrl = `/events/${event.id}`;
    setIsExpanding(true);

    const isReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      !isReducedMotion
    ) {
      document.startViewTransition(() => {
        navigate(targetUrl);
      });
    } else {
      navigate(targetUrl);
    }
  };

  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(event.id);

  return (
    <div
      className={`relative flex flex-col h-full group [container-type:inline-size] [--card-pad:20px] md:[--card-pad:24px] ${className}`}
    >
      {/* Clickable Card Link Container */}
      <Link
        to={`/events/${event.id}`}
        onClick={handleCardClick}
        title={title}
        {...handlers}
        className="relative flex flex-col flex-1 h-full bg-[#0D1020] rounded-xl border border-white/10 card-strange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] p-5 md:p-6 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#FF7A1A]/50 group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.8)] select-none"
      >
        {/* Gold Corner Illuminating Details */}
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#F5B642]/30 group-hover:border-[#F5B642] transition-colors pointer-events-none z-20" aria-hidden="true" />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#F5B642]/30 group-hover:border-[#F5B642] transition-colors pointer-events-none z-20" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#F5B642]/30 group-hover:border-[#F5B642] transition-colors pointer-events-none z-20" aria-hidden="true" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#F5B642]/30 group-hover:border-[#F5B642] transition-colors pointer-events-none z-20" aria-hidden="true" />

        {/* 1. Cinematic 3:2 Image with slots badge & dark bottom fade */}
        <div className="relative w-full aspect-[3/2] md:min-h-[210px] rounded-lg overflow-hidden bg-[#07060D] shrink-0 border border-white/10">
          <img
            src={optimizedUrl}
            srcSet={srcSet}
            sizes="(max-width: 640px) calc(100vw - 56px), (max-width: 1024px) 50vw, 440px"
            alt={event.cover_image_alt || title}
            width={600}
            height={400}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'low'}
            decoding="async"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            style={{ viewTransitionName: `event-img-${event.id}` }}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {/* Cinematic Dark Gradient Scrim fading to black */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1020] via-[#0D1020]/40 to-transparent pointer-events-none" />

          {/* Slots Badge Top-Right ONLY */}
          {slotBadgeText && (
            <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none max-w-[70%] min-w-0 text-right">
              <span className="inline-block max-w-full truncate text-[10px] sm:text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-black/85 border border-[#FF7A1A]/60 text-[#F5B642]">
                {slotBadgeText}
              </span>
            </div>
          )}

          {/* Click Expanding Realm Ring Indicator */}
          {isExpanding && (
            <div
              className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center animate-portal-arrival-expand"
              aria-hidden="true"
            >
              <div
                className="w-full h-full rounded-full border-4"
                style={{
                  borderColor: realm.accentColor,
                  boxShadow: `0 0 30px ${realm.accentColor}`,
                }}
              />
            </div>
          )}
        </div>

        {/* 2. Body Order in Dark Lower Area */}
        <div className="pt-4 pb-1 flex-1 flex flex-col justify-between gap-3.5 min-w-0">
          <div className="space-y-2 min-w-0">
            {/* Type line ABOVE title (left) + Reserved 48px slot for Heart (right) */}
            <div className="flex items-center justify-between gap-2 min-w-0 h-12">
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#B8B3C7] truncate max-w-[calc(100%-48px)]">
                {category || realm.name}
              </span>
              {/* 48px reserved spacing so type line never overlaps the heart button */}
              <div className="w-12 h-12 shrink-0 pointer-events-none" aria-hidden="true" />
            </div>

            {/* Title with line-clamp-2 md:line-clamp-3 */}
            <div className="min-h-[3.6rem] flex items-start">
              <h3 className="font-display font-bold text-base sm:text-lg md:text-xl leading-snug text-[#F3EFE8] line-clamp-2 md:line-clamp-3 group-hover:text-[#F5B642] transition-colors break-words">
                {title}
              </h3>
            </div>

            {/* Blurb clamp: 2 lines mobile, 3 lines md+ */}
            <p className="text-xs md:text-sm text-[#B8B3C7] line-clamp-2 md:line-clamp-3 leading-relaxed">
              {blurb}
            </p>

            {/* Date, Team Size, and Plain Registration Status Tag */}
            <div className="flex items-center justify-between gap-2 min-w-0 pt-1 text-xs sm:text-sm text-[#B8B3C7]">
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                {hasDate && (
                  <div className="flex items-center gap-1.5 truncate">
                    <svg
                      className="w-3.5 h-3.5 shrink-0 text-[#FF7A1A]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-mono text-xs truncate">{dateFormatted}</span>
                  </div>
                )}
                {teamSizeText && (
                  <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#B8B3C7]">
                    {teamSizeText}
                  </span>
                )}
              </div>
              <span
                className={`shrink-0 text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${statusTagColor}`}
              >
                {statusTagText}
              </span>
            </div>
          </div>

          {/* Full-Width Action Button: min-height 48px on md+ (44px on mobile) */}
          <div className="pt-2">
            <span className="w-full min-h-[44px] md:min-h-[48px] py-3 md:py-3.5 px-4 text-center text-xs md:text-sm font-bold uppercase tracking-widest rounded-lg bg-gradient-to-r from-[#FF7A1A] to-[#F5B642] text-[#07060D] border border-[#FF7A1A] shadow-[0_2px_12px_rgba(255,122,26,0.3)] group-hover:brightness-110 group-hover:shadow-[0_4px_20px_rgba(255,122,26,0.5)] transition-all flex items-center justify-center">
              ENTER DIMENSION
            </span>
          </div>

          {/* Footer Bar: Entry fee and price */}
          <div className="pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 min-w-0 mt-auto">
            <span className="font-mono text-xs uppercase tracking-wider text-[#B8B3C7]">
              ENTRY FEE
            </span>

            <div className="text-right truncate">
              {isFree ? (
                <span className="font-bold text-sm md:text-base text-[#F5B642]">Free</span>
              ) : (
                <span className="font-bold text-sm md:text-base text-[#F5B642]">
                  ₹
                  {new Intl.NumberFormat('en-IN', {
                    maximumFractionDigits: 0,
                  }).format(event.price as number)}
                  <span className="text-xs text-[#B8B3C7] font-normal ml-1">
                    {isPerHead ? 'per person' : 'per team'}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Cloak of Levitation Backside Hover Reveal */}
        <div className="cloak-backside" aria-hidden="true">
          <div className="cloak-lining flex flex-col justify-between p-5 md:p-6 overflow-hidden relative">
            <div className="space-y-2 min-w-0 relative z-10">
              <div
                className="text-xs font-bold uppercase tracking-widest truncate"
                style={{ color: realm.accentColor }}
              >
                {realm.name}
              </div>
              <h4 className="card-portal-title font-display font-bold text-base sm:text-lg text-[#FFF8E7] line-clamp-2 leading-snug break-words">
                {title}
              </h4>
              <p className="text-xs sm:text-sm text-[#E8DCC0] line-clamp-3 leading-relaxed">
                {blurb}
              </p>
            </div>

            {/* Central Portal Opening */}
            <div
              className={`card-portal-container ${isExpanding ? 'portal-expanding' : ''}`}
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 120 120"
                className="w-full h-full overflow-visible drop-shadow-[0_0_12px_rgba(255,122,26,0.5)]"
              >
                <circle cx="60" cy="60" r="42" fill="#07060D" />
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  stroke={realm.accentColor}
                  strokeWidth="2.5"
                  strokeDasharray="20 8 40 12"
                />
              </svg>
            </div>

            <div className="relative z-10 flex items-center justify-between border-t border-[#D4AF37]/30 pt-2 text-xs text-[#FFE5A3] font-mono">
              <span>{category || 'STRANGE'}</span>
              <span>ENTER DIMENSION</span>
            </div>
          </div>
        </div>
      </Link>

      {/* 4. Sibling Heart Button (Positioned over the reserved slot, no overlap, accessible, 48px hit area) */}
      <button
        type="button"
        aria-label={isFav ? `Remove ${title} from saved` : `Save ${title} to favorites`}
        aria-pressed={isFav}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          toggleFavorite(event.id);
        }}
        style={{
          top: 'calc(var(--card-pad) + (100cqw - var(--card-pad) * 2) * 2 / 3 + 14px)',
          right: 'var(--card-pad)',
        }}
        className="absolute z-20 w-12 h-12 min-h-[48px] min-w-[48px] rounded-full flex items-center justify-center bg-[#07060D]/85 border border-white/20 hover:border-[#E11D48] hover:bg-[#E11D48]/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48] cursor-pointer"
      >
        <svg
          className={`w-5 h-5 transition-transform active:scale-125 ${
            isFav ? 'fill-[#E11D48] text-[#E11D48]' : 'text-[#B8B3C7] hover:text-[#E11D48]'
          }`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          fill={isFav ? '#E11D48' : 'none'}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
    </div>
  );
};

export const EventCardSkeleton: FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`flex flex-col bg-[#0D1020] rounded-xl border border-white/10 p-5 md:p-6 select-none ${className}`}
    >
      {/* 3:2 image block with min-height on desktop */}
      <div className="relative aspect-[3/2] md:min-h-[210px] w-full rounded-lg bg-white/5 mb-4 overflow-hidden">
        <div className="absolute top-2.5 right-2.5 w-20 h-4 rounded bg-white/10" />
      </div>

      <div className="space-y-3.5 px-0.5 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Type line placeholder with heart placeholder */}
          <div className="flex items-center justify-between gap-2 h-12">
            <div className="h-4 w-28 rounded bg-white/10" />
            <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 shrink-0" />
          </div>
          {/* Title placeholder */}
          <div className="space-y-2">
            <div className="h-6 w-4/5 rounded bg-white/10" />
            <div className="h-6 w-3/5 rounded bg-white/10" />
          </div>
          {/* Blurb placeholder */}
          <div className="space-y-1.5 pt-1">
            <div className="h-3.5 w-full rounded bg-white/5" />
            <div className="h-3.5 w-4/5 rounded bg-white/5" />
          </div>
          {/* Date & status placeholder */}
          <div className="flex items-center justify-between gap-2 pt-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-sm bg-white/10" />
              <div className="h-3.5 w-32 rounded bg-white/10" />
            </div>
            <div className="h-5 w-20 rounded border border-white/10 bg-white/5" />
          </div>
        </div>

        {/* Full-width 48px button block */}
        <div className="min-h-[44px] md:min-h-[48px] w-full rounded-lg bg-white/10 mt-2" />

        {/* Footer line */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="h-3.5 w-20 rounded bg-white/10" />
          <div className="h-4 w-16 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
};

