import { useState, type FC, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePrefetchEvent } from '../../hooks/useEvents';
import {
  getOptimizedImageUrl,
  getImageSrcSet,
  FALLBACK_IMAGE_DATA_URI,
} from '../../lib/images';
import { formatDateIST } from '../../lib/format';
import { useFavorites } from '../../lib/favorites';
import { StatusBadge } from '../ui/StatusBadge';
import type { EventSummary } from '../../lib/types';

export interface EventCardProps {
  event: Partial<EventSummary> & { id: string };
  priority?: boolean;
  className?: string;
}

export const EventCard: FC<EventCardProps> = ({
  event,
  priority = false,
  className = '',
}) => {
  const navigate = useNavigate();
  const { handlers } = usePrefetchEvent(event.id);
  const [imageFailed, setImageFailed] = useState<boolean>(false);

  const rawImageUrl = event.cover_image_url;
  const hasValidImage = Boolean(rawImageUrl && !imageFailed);
  const optimizedUrl = hasValidImage
    ? getOptimizedImageUrl(rawImageUrl, 600, 400)
    : FALLBACK_IMAGE_DATA_URI;
  const srcSet = hasValidImage
    ? getImageSrcSet(rawImageUrl, [380, 500, 680, 900], 2 / 3)
    : undefined;

  const title = event.name || 'Event';
  const category = event.category;
  const blurb =
    event.blurb || 'Discover event guidelines, schedules, rules, and entry specifications.';
  const dateFormatted = formatDateIST(event.schedule_summary);
  const hasDate = Boolean(dateFormatted && dateFormatted !== 'TBA');

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

  // Action button configuration
  let buttonLabel: string;
  let isOpen = false;

  if (isCompleted) {
    buttonLabel = 'COMPLETED';
  } else if (isSoldOut) {
    buttonLabel = 'SOLD OUT';
  } else if (event.registration_status === 'OPEN') {
    buttonLabel = 'REGISTER';
    isOpen = true;
  } else {
    buttonLabel = 'REGISTRATION CLOSED';
  }

  // Pricing display
  const isFree =
    event.price === 0 || event.price === null || event.price === undefined;
  const isPerHead = event.is_per_head !== false;

  // Tags for cloak lining backside (up to 4 tags)
  const displayTags: string[] = (
    Array.isArray(event.tags) && event.tags.length > 0
      ? event.tags.filter((t): t is string => typeof t === 'string' && Boolean(t))
      : [
          category,
          event.event_type === 'WORKSHOP' ? 'Workshop' : 'Competition',
          event.is_technical ? 'Technical' : null,
        ].filter((t): t is string => Boolean(t))
  ).slice(0, 4);

  const [isExpanding, setIsExpanding] = useState<boolean>(false);

  // Smooth View Transitions API navigation if supported and motion not reduced
  const handleCardClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetUrl = `/events/${event.id}`;
    setIsExpanding(true);

    if (
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
    <div className={`relative flex flex-col h-full ${className}`}>
      <Link
        to={`/events/${event.id}`}
        onClick={handleCardClick}
        title={title}
        {...handlers}
        className="group relative flex flex-col flex-1 h-full bg-[#0D1020] rounded-xl border border-white/10 card-strange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] p-3 sm:p-3.5 overflow-hidden transition-all hover:border-[#FF7A1A]/40"
      >
      {/* 1. 3:2 Image with ONLY Slots Badge (top-right) */}
      <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden bg-[#07060D] shrink-0 border border-white/10">
        <img
          src={optimizedUrl}
          srcSet={srcSet}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
          alt={event.cover_image_alt || title}
          width={600}
          height={400}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding={priority ? 'sync' : 'async'}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
          style={{ viewTransitionName: `event-img-${event.id}` }}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Ambient Dark Gradient Scrim at the bottom of the image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1020] via-[#0D1020]/20 to-transparent pointer-events-none" />

        {/* Slots Badge Top-Right ONLY (hidden when seat data missing or completed) */}
        {slotBadgeText && (
          <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none max-w-[70%] min-w-0 text-right">
            <span className="inline-block max-w-full truncate text-[10px] sm:text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-black/80 border border-[#FF7A1A]/60 text-[#F5B642] backdrop-blur-sm">
              {slotBadgeText}
            </span>
          </div>
        )}
      </div>

      {/* 2. Body Order:
          1) Type line ABOVE title + Status tag where it fits without crowding (flex-wrap, min-w-0)
          2) Title with line-clamp-3 and fixed 3-line min-height
          3) Date row with heart
          4) Action button
          5) Entry fee footer
      */}
      <div className="pt-3 pb-1 flex-1 flex flex-col justify-between gap-3 min-w-0">
        <div className="space-y-2 min-w-0">
          {/* Type line (small plain muted text, truncated 1 line) + Status tag */}
          <div className="flex items-center justify-between gap-2 min-w-0 flex-wrap">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#B8B3C7] truncate max-w-[60%]">
              {category || 'STRANGE'}
            </span>
            {event.registration_status && (
              <StatusBadge type="registration" status={event.registration_status} size="sm" />
            )}
          </div>

          {/* Title in bold, line-clamp-3 with reserved 3-line min-height for uniform card heights */}
          <div className="min-h-[4.2rem]">
            <h3 className="font-display font-bold text-[16px] leading-[1.3] text-[#F3EFE8] line-clamp-3 group-hover:text-[#FF7A1A] transition-colors break-words">
              {title}
            </h3>
          </div>

          {/* Date Row with heart button space beside it */}
          <div className="flex items-center justify-between gap-2 min-w-0 pt-0.5">
            {hasDate ? (
              <div className="flex items-center gap-1.5 text-xs text-[#B8B3C7] min-w-0 truncate">
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
            ) : (
              <div className="min-w-0" />
            )}
            {/* 48px reserved slot for heart button */}
            <div className="w-12 h-12 shrink-0 pointer-events-none" aria-hidden="true" />
          </div>
        </div>

        {/* Full-width Button (styled span, not a button element, goes to /events/:id) */}
        <div className="pt-1">
          <span
            className={`w-full block py-2.5 px-3 text-center text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
              isOpen
                ? 'bg-gradient-to-r from-[#FF7A1A] to-[#F5B642] text-[#07060D] border border-[#FF7A1A] shadow-[0_2px_10px_rgba(255,122,26,0.25)] group-hover:brightness-110'
                : 'bg-white/5 border border-white/10 text-[#B8B3C7]'
            }`}
          >
            {buttonLabel}
          </span>
        </div>

        {/* 3. Footer Bar: Thin top border, left "ENTRY FEE" (mono, muted), right price in bold amber */}
        <div className="pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 min-w-0 mt-auto">
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

      {/* 4. Cloak of Levitation Backside (revealed on hover and :focus-visible on fine pointer devices) */}
      <div className="cloak-backside" aria-hidden="true">
        {/* Inner Lining (Dark gold/ochre with fine embroidered pattern) */}
        <div className="cloak-lining flex flex-col justify-between p-4 overflow-hidden relative">
          {/* Top block: category, 3D title, blurb */}
          <div className="space-y-2 min-w-0 relative z-10">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] truncate">
              {category || 'STRANGE'}
            </div>
            <h4 className="card-portal-title font-display font-bold text-base text-[#FFF8E7] line-clamp-2 leading-snug break-words">
              {title}
            </h4>
            <p className="text-xs text-[#E8DCC0] line-clamp-3 leading-relaxed">
              {blurb}
            </p>
          </div>

          {/* Central Portal Opening between blurb and tags */}
          <div
            className={`card-portal-container ${isExpanding ? 'portal-expanding' : ''}`}
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 120 120"
              className="w-full h-full overflow-visible drop-shadow-[0_0_12px_rgba(255,122,26,0.5)]"
            >
              <defs>
                <linearGradient id={`cp-grad-${event.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF7A1A" />
                  <stop offset="50%" stopColor="#F5B642" />
                  <stop offset="100%" stopColor="#FF5500" />
                </linearGradient>
                <radialGradient id={`cp-core-${event.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#050308" stopOpacity="0.95" />
                  <stop offset="70%" stopColor="#07060D" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#FF7A1A" stopOpacity="0.35" />
                </radialGradient>
              </defs>

              {/* Dark cosmic core with subtle radial glow */}
              <circle cx="60" cy="60" r="42" fill={`url(#cp-core-${event.id})`} />

              {/* Faint inner ring scaling independently for depth */}
              <circle
                cx="60"
                cy="60"
                r="34"
                fill="none"
                stroke="#F5B642"
                strokeWidth="1"
                strokeDasharray="4 6"
                strokeOpacity="0.5"
                className="card-portal-inner-ring"
              />

              {/* Main fiery portal ring with glow */}
              <circle
                cx="60"
                cy="60"
                r="44"
                fill="none"
                stroke={`url(#cp-grad-${event.id})`}
                strokeWidth="2.5"
                className="card-portal-outer-ring"
              />

              {/* 7 spark dots traveling around circumference */}
              {Array.from({ length: 7 }).map((_, i) => (
                <g
                  key={i}
                  className="card-portal-spark-orbit"
                  style={{ animationDelay: `${-i * 0.37}s` }}
                >
                  <circle
                    cx="60"
                    cy="16"
                    r={i % 2 === 0 ? 2 : 1.5}
                    fill="#FFF4D0"
                  />
                  <path
                    d="M 60 16 A 44 44 0 0 0 54 16.5"
                    fill="none"
                    stroke="#FF7A1A"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.75"
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* Bottom block: tags and explore action */}
          <div className="pt-2 space-y-3 relative z-10">
            {displayTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 max-h-14 overflow-hidden">
                {displayTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-[#2E2005] text-[#F7D272] border border-[#D4AF37]/40 truncate max-w-[120px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-1">
              <span className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-center text-xs font-bold uppercase tracking-widest rounded-xl bg-[#D4AF37] text-[#0A0702] shadow-sm transition-all">
                <span>View Event</span>
                <svg
                  className="card-portal-arrow w-3.5 h-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Red Cloak Fabric Layer (peels/sweeps away from corner) */}
        <div className="cloak-fabric" />
      </div>
    </Link>

    {/* Heart (Favorites) toggle: a sibling of the Link (never nested inside it), placed in the card body next to the date row so it never overlaps image badges, z-index above the cloak lining, aria-pressed, aria-label "Add {name} to favorites" / "Remove {name} from favorites", 48px visual & hit area, stopPropagation, filled orange when active, thin border, short scale-pop (none under reduced motion), no layout shift */}
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col p-3 sm:p-3.5">
      {/* Spacer matching 3:2 image */}
      <div className="w-full aspect-[3/2] shrink-0" aria-hidden="true" />
      {/* Spacer matching body padding and elements above date row */}
      <div className="pt-3 space-y-2">
        <div className="h-5" aria-hidden="true" />
        <div className="min-h-[4.2rem]" aria-hidden="true" />
        <div className="flex justify-end pt-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(event.id);
            }}
            aria-pressed={isFav}
            aria-label={isFav ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
            className={`pointer-events-auto w-12 h-12 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full border bg-[#07060D]/85 backdrop-blur-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] active:scale-95 motion-reduce:active:scale-100 ${
              isFav
                ? 'border-[#FF7A1A]/60 text-[#FF7A1A]'
                : 'border-white/15 text-[#B8B3C7] hover:text-[#FF7A1A] hover:border-[#FF7A1A]/40'
            }`}
          >
            <svg
              className={`w-6 h-6 transition-transform ${
                isFav ? 'fill-[#FF7A1A] text-[#FF7A1A] scale-105' : 'fill-none text-[#B8B3C7] hover:text-[#FF7A1A]'
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
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
      </div>
    </div>
  </div>
  );
};

export const EventCardSkeleton: FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`flex flex-col bg-[#0D1020] rounded-xl border border-white/10 p-3 sm:p-3.5 select-none ${className}`}
    >
      {/* 3:2 image block with ONLY top-right slots pill placeholder */}
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
