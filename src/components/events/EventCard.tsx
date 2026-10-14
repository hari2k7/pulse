import { useState, type FC, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePrefetchEvent } from '../../hooks/useEvents';
import {
  getOptimizedImageUrl,
  getImageSrcSet,
  FALLBACK_IMAGE_DATA_URI,
} from '../../lib/images';
import { formatPrice, formatDateIST } from '../../lib/format';
import { StatusBadge } from '../ui/StatusBadge';
import type { EventSummary } from '../../lib/types';

export interface EventCardProps {
  event: Partial<EventSummary> & { id: string };
  priority?: boolean;
  className?: string;
  isFlagshipSpan?: boolean;
}

export const EventCard: FC<EventCardProps> = ({
  event,
  priority = false,
  className = '',
  isFlagshipSpan = false,
}) => {
  const navigate = useNavigate();
  const { handlers } = usePrefetchEvent(event.id);
  const [imageFailed, setImageFailed] = useState<boolean>(false);

  const rawImageUrl = event.cover_image_url;
  const hasValidImage = Boolean(rawImageUrl && !imageFailed);
  const optimizedUrl = hasValidImage
    ? getOptimizedImageUrl(rawImageUrl, isFlagshipSpan ? 900 : 600, isFlagshipSpan ? 600 : 400)
    : FALLBACK_IMAGE_DATA_URI;
  const srcSet = hasValidImage
    ? getImageSrcSet(rawImageUrl, [380, 500, 680, 900], 2 / 3)
    : undefined;

  const title = event.name || 'Event';
  const category = event.category;
  const blurb = event.blurb || 'Discover event details, guidelines, rules, and entry specifications.';
  const dateFormatted = formatDateIST(event.schedule_summary);
  const priceFormatted = formatPrice(event.price, event.is_per_head);

  // Dynamic slot calculation: total_seats - seats_filled
  const hasSlotData =
    typeof event.total_seats === 'number' && typeof event.seats_filled === 'number';
  const remainingSlots = hasSlotData
    ? Math.max(0, (event.total_seats as number) - (event.seats_filled as number))
    : null;

  const isPerHead = event.is_per_head !== false;
  const slotsLabel = isPerHead ? 'seats left' : 'team slots left';

  // Up to 3 display tags for cloak lining
  const displayTags: string[] = (
    Array.isArray(event.tags) && event.tags.length > 0
      ? event.tags.filter((t): t is string => typeof t === 'string' && Boolean(t))
      : [category, event.event_type === 'WORKSHOP' ? 'Workshop' : 'Competition', event.is_technical ? 'Technical' : null].filter((t): t is string => Boolean(t))
  ).slice(0, 3);

  // Smooth View Transitions API navigation if supported and motion not reduced
  const handleCardClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const targetUrl = `/events/${event.id}`;

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

  return (
    <Link
      to={`/events/${event.id}`}
      onClick={handleCardClick}
      {...handlers}
      className={`group relative flex flex-col bg-[#0D1020] rounded-xl border border-white/10 card-strange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] p-3 sm:p-3.5 overflow-hidden transition-colors ${className}`}
    >
      {/* 1. 3:2 Image Frame with at most ONE label at top-left */}
      <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden bg-[#07060D] shrink-0 border border-white/10">
        <img
          src={optimizedUrl}
          srcSet={srcSet}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={event.cover_image_alt || title}
          width={600}
          height={400}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding={priority ? 'sync' : 'async'}
          onError={() => setImageFailed(true)}
          style={{ viewTransitionName: `event-img-${event.id}` }}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Ambient Gradient Overlay for bottom edge contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1020] via-transparent to-transparent pointer-events-none" />

        {/* At most ONE small label on the image (top-left) */}
        {category && (
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none max-w-[80%]">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#07060D]/90 border border-white/20 text-[#F3EFE8] truncate block">
              {category}
            </span>
          </div>
        )}
      </div>

      {/* 2. Card Body in Normal Flow */}
      <div className="pt-3 pb-1 flex-1 flex flex-col justify-between gap-3 min-w-0">
        <div className="space-y-1.5 min-w-0">
          {/* Title: wraps naturally up to 2 lines */}
          <h3 className="font-display font-bold text-base sm:text-lg text-[#F3EFE8] line-clamp-2 leading-snug group-hover:text-[#FF7A1A] transition-colors break-words">
            {title}
          </h3>

          {/* Date/Time IST and Price */}
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs">
            <span className="text-[#B8B3C7] font-mono">{dateFormatted}</span>
            <span className="font-bold text-[#F3EFE8]">{priceFormatted}</span>
          </div>
        </div>

        {/* Footer row using flex-wrap with min-w-0 and gap */}
        <div className="pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 min-w-0 text-xs">
          <div className="min-w-0 shrink-0">
            {event.registration_status && (
              <StatusBadge type="registration" status={event.registration_status} size="sm" />
            )}
          </div>

          {remainingSlots !== null && event.event_status === 'ACTIVE' && (
            <span
              className={`text-xs font-medium truncate ${
                remainingSlots <= 5 ? 'text-[#FF7A1A] font-bold' : 'text-[#B8B3C7]'
              }`}
            >
              {remainingSlots <= 5 ? `Only ${remainingSlots} left` : `${remainingSlots} ${slotsLabel}`}
            </span>
          )}
        </div>
      </div>

      {/* 3. Cloak of Levitation Backside (revealed on hover and :focus-visible on fine pointer devices) */}
      <div className="cloak-backside" aria-hidden="true">
        {/* Inner Lining (Dark gold/ochre with fine embroidered pattern) */}
        <div className="cloak-lining">
          <div className="space-y-2 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
              {category || 'STRANGE'}
            </div>
            <h4 className="font-display font-bold text-base text-[#FFF8E7] line-clamp-2 leading-snug break-words">
              {title}
            </h4>
            <p className="text-xs text-[#E8DCC0] line-clamp-3 leading-relaxed">
              {blurb}
            </p>
          </div>

          <div className="pt-3 space-y-3">
            {displayTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {displayTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-[#2E2005] text-[#F7D272] border border-[#D4AF37]/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-1">
              <span className="inline-block px-3 py-1.5 rounded bg-[#D4AF37] text-[#0A0702] font-bold text-xs uppercase tracking-wider shadow-sm">
                View Event
              </span>
            </div>
          </div>
        </div>

        {/* Red Cloak Fabric Layer (peels/sweeps away from corner) */}
        <div className="cloak-fabric" />
      </div>
    </Link>
  );
};

export const EventCardSkeleton: FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`flex flex-col bg-[#0D1020] rounded-xl border border-white/5 p-3 sm:p-3.5 animate-pulse select-none ${className}`}
    >
      <div className="aspect-[3/2] w-full rounded-lg bg-[#1A1030]/60 mb-3" />
      <div className="space-y-2.5 px-1 flex-1">
        <div className="h-5 w-4/5 rounded bg-[#1A1030]" />
        <div className="h-4 w-3/5 rounded bg-[#1A1030]/60" />
        <div className="h-4 w-28 rounded bg-[#1A1030]/50 pt-2" />
      </div>
    </div>
  );
};
