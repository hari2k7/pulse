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
    <div className={`relative flex flex-col h-full group ${className}`}>
      {/* Clickable Card Link Container */}
      <Link
        to={`/events/${event.id}`}
        onClick={handleCardClick}
        title={title}
        {...handlers}
        className="relative flex flex-col flex-1 h-full bg-[#0D1020] rounded-xl border border-white/10 card-strange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] p-3 sm:p-3.5 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#FF7A1A]/50 group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.8)] select-none"
      >
        {/* Gold Corner Illuminating Details */}
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#F5B642]/30 group-hover:border-[#F5B642] transition-colors pointer-events-none z-20" aria-hidden="true" />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#F5B642]/30 group-hover:border-[#F5B642] transition-colors pointer-events-none z-20" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#F5B642]/30 group-hover:border-[#F5B642] transition-colors pointer-events-none z-20" aria-hidden="true" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#F5B642]/30 group-hover:border-[#F5B642] transition-colors pointer-events-none z-20" aria-hidden="true" />

        {/* 1. Cinematic 3:2 Image with slots badge & dark bottom fade */}
        <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden bg-[#07060D] shrink-0 border border-white/10">
          <img
            src={optimizedUrl}
            srcSet={srcSet}
            sizes="(max-width: 640px) calc(100vw - 56px), (max-width: 1024px) 50vw, 380px"
            alt={event.cover_image_alt || title}
            width={600}
            height={400}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
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
        <div className="pt-3 pb-1 flex-1 flex flex-col justify-between gap-3 min-w-0">
          <div className="space-y-1.5 min-w-0">
            {/* Type line ABOVE title + Plain Registration Status Tag */}
            <div className="flex items-center justify-between gap-2 min-w-0 flex-wrap">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#B8B3C7] truncate max-w-[55%]">
                {category || realm.name}
              </span>
              <span
                className={`text-[10px] sm:text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${statusTagColor}`}
              >
                {statusTagText}
              </span>
            </div>

            {/* Title with line-clamp-3 and reserved 3-line height */}
            <div className="min-h-[4.2rem] flex items-start">
              <h3 className="font-display font-bold text-[16px] leading-[1.3] text-[#F3EFE8] line-clamp-3 group-hover:text-[#F5B642] transition-colors break-words">
                {title}
              </h3>
            </div>

            {/* Date & Team Size Row */}
            <div className="flex items-center justify-between gap-2 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 text-xs text-[#B8B3C7] min-w-0 truncate">
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
                    <span className="font-mono text-[11px] truncate">{dateFormatted}</span>
                  </div>
                )}
                {teamSizeText && (
                  <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#B8B3C7]">
                    {teamSizeText}
                  </span>
                )}
              </div>

              {/* Reserved 44px slot for sibling heart button */}
              <div className="w-11 h-11 shrink-0 pointer-events-none" aria-hidden="true" />
            </div>
          </div>

          {/* Full-Width Action Button: STRICTLY "ENTER DIMENSION" */}
          <div className="pt-1">
            <span className="w-full block py-2.5 px-3 text-center text-xs font-bold uppercase tracking-widest rounded-lg bg-gradient-to-r from-[#FF7A1A] to-[#F5B642] text-[#07060D] border border-[#FF7A1A] shadow-[0_2px_12px_rgba(255,122,26,0.3)] group-hover:brightness-110 transition-all">
              ENTER DIMENSION
            </span>
          </div>

          {/* Footer Bar: Entry fee and price */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 min-w-0 mt-auto">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#B8B3C7]">
              ENTRY FEE
            </span>

            <div className="text-right truncate">
              {isFree ? (
                <span className="font-bold text-sm text-[#F5B642]">Free</span>
              ) : (
                <span className="font-bold text-sm text-[#F5B642]">
                  ₹
                  {new Intl.NumberFormat('en-IN', {
                    maximumFractionDigits: 0,
                  }).format(event.price as number)}
                  <span className="text-[10px] text-[#B8B3C7] font-normal ml-1">
                    {isPerHead ? 'per person' : 'per team'}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Cloak of Levitation Backside Hover Reveal */}
        <div className="cloak-backside" aria-hidden="true">
          <div className="cloak-lining flex flex-col justify-between p-4 overflow-hidden relative">
            <div className="space-y-2 min-w-0 relative z-10">
              <div
                className="text-[10px] font-bold uppercase tracking-widest truncate"
                style={{ color: realm.accentColor }}
              >
                {realm.name}
              </div>
              <h4 className="card-portal-title font-display font-bold text-base text-[#FFF8E7] line-clamp-2 leading-snug break-words">
                {title}
              </h4>
              <p className="text-xs text-[#E8DCC0] line-clamp-3 leading-relaxed">
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

            <div className="relative z-10 flex items-center justify-between border-t border-[#D4AF37]/30 pt-2 text-[10px] text-[#FFE5A3] font-mono">
              <span>{category || 'STRANGE'}</span>
              <span>ENTER DIMENSION</span>
            </div>
          </div>
        </div>
      </Link>

      {/* 4. Sibling Heart Button (Positioned over the reserved slot, no overlap, accessible) */}
      <button
        type="button"
        aria-label={isFav ? `Remove ${title} from saved` : `Save ${title} to favorites`}
        aria-pressed={isFav}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          toggleFavorite(event.id);
        }}
        className="absolute bottom-[4.2rem] right-4 z-20 w-11 h-11 rounded-full flex items-center justify-center bg-[#07060D]/80 border border-white/20 hover:border-[#E11D48] hover:bg-[#E11D48]/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]"
      >
        <svg
          className={`w-4 h-4 transition-transform active:scale-125 ${
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
      className={`flex flex-col bg-[#0D1020] rounded-xl border border-white/10 p-3 sm:p-3.5 select-none ${className}`}
    >
      {/* 3:2 image block with top-right slots pill placeholder */}
      <div className="relative aspect-[3/2] w-full rounded-lg bg-white/5 mb-3 overflow-hidden">
        <div className="absolute top-2.5 right-2.5 w-20 h-4 rounded bg-white/10" />
      </div>

      <div className="space-y-3 px-0.5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Type line placeholder */}
          <div className="h-3.5 w-24 rounded bg-white/10" />
          {/* Three-line title placeholder */}
          <div className="space-y-1.5 min-h-[4.2rem]">
            <div className="h-4.5 w-4/5 rounded bg-white/10" />
            <div className="h-4.5 w-3/5 rounded bg-white/10" />
            <div className="h-4.5 w-2/5 rounded bg-white/5" />
          </div>
          {/* Date line with heart button placeholder */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-sm bg-white/10" />
              <div className="h-3 w-28 rounded bg-white/10" />
            </div>
            <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5" />
          </div>
        </div>

        {/* Full-width button block */}
        <div className="h-10 w-full rounded-xl bg-white/10 mt-1" />

        {/* Footer line */}
        <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
          <div className="h-3 w-16 rounded bg-white/10" />
          <div className="h-3.5 w-14 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
};

