import { useState, type FC, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePrefetchEvent } from '../../hooks/useEvents';
import {
  getOptimizedImageUrl,
  getImageSrcSet,
  FALLBACK_IMAGE_DATA_URI,
} from '../../lib/images';
import { formatPrice, formatDateIST } from '../../lib/format';
import { getEventDimension } from '../../lib/dimensions';
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

  const dimension = getEventDimension({
    category: event.category,
    event_type: event.event_type,
    is_technical: event.is_technical,
  });

  const rawImageUrl = event.cover_image_url;
  const hasValidImage = Boolean(rawImageUrl && !imageFailed);
  const optimizedUrl = hasValidImage
    ? getOptimizedImageUrl(rawImageUrl, isFlagshipSpan ? 900 : 600, isFlagshipSpan ? 600 : 400)
    : FALLBACK_IMAGE_DATA_URI;
  const srcSet = hasValidImage
    ? getImageSrcSet(rawImageUrl, [380, 500, 680, 900], 2 / 3)
    : undefined;

  const title = event.name || 'Dimensional Event';
  const category = event.category;
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

  const isOpen = event.registration_status === 'OPEN';

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
      className={`group relative flex flex-col bg-[#0D1020] rounded-xl border border-white/10 hover:border-[${dimension.colorHex}] transition-all duration-300 card-strange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A] p-3 overflow-hidden ${className}`}
      style={{
        borderColor: undefined,
      }}
    >
      {/* 1. Miniature Portal Artwork & 3:2 Image Frame */}
      <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden bg-[#07060D] shrink-0 border border-white/10 group-hover:border-[#FF7A1A]/60 transition-colors">
        {/* Animated portal ring glow on hover / focus-visible */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
          style={{
            boxShadow: `inset ${dimension.glowShadow}`,
          }}
          aria-hidden="true"
        />

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

        {/* Ambient Gradient Overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1020] via-[#0D1020]/20 to-transparent pointer-events-none" />

        {/* Category & Dimension Badge (Top Left) */}
        {category && (
          <div className="absolute top-2.5 left-2.5 z-20">
            <span
              className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#07060D]/90 backdrop-blur-md border shadow-md inline-flex items-center gap-1.5"
              style={{
                borderColor: `${dimension.colorHex}70`,
                color: dimension.colorHex,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dimension.colorHex }} aria-hidden="true" />
              <span>{category}</span>
            </span>
          </div>
        )}

        {/* Slots Badge (Top Right) */}
        {remainingSlots !== null && event.event_status === 'ACTIVE' && (
          <div className="absolute top-2.5 right-2.5 z-20">
            <span
              className={`text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-md backdrop-blur-md border shadow-md ${
                remainingSlots <= 5
                  ? 'text-[#FF7A1A] bg-[#07060D]/95 border-[#FF7A1A]'
                  : 'text-[#F3EFE8] bg-[#07060D]/85 border-white/20'
              }`}
            >
              {remainingSlots <= 5 ? `Only ${remainingSlots} left` : `${remainingSlots} ${slotsLabel}`}
            </span>
          </div>
        )}

        {/* Cloak Sweep Reveal Motif (300 to 500ms transition) */}
        <div
          className="cloak-sweep z-10 hidden sm:block"
          aria-hidden="true"
        />
      </div>

      {/* 2. Card Content Body */}
      <div className="pt-4 pb-2 px-1 flex-1 flex flex-col justify-between gap-3 relative z-20">
        <div className="space-y-2">
          {/* Status & Date Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {event.registration_status && (
              <StatusBadge type="registration" status={event.registration_status} size="sm" />
            )}
            <span className="text-xs text-[#B8B3C7] font-medium">
              {dateFormatted}
            </span>
          </div>

          {/* Event Title (Natural wrap up to 2 lines) */}
          <h3 className="font-display font-bold text-base sm:text-lg text-[#F3EFE8] line-clamp-2 leading-snug group-hover:text-[#FF7A1A] transition-colors">
            {title}
          </h3>

          {/* Blurb if available in summary */}
          {event.blurb && (
            <p className="text-xs text-[#B8B3C7] line-clamp-2 leading-relaxed">
              {event.blurb}
            </p>
          )}
        </div>

        {/* 3. Action & Logistics Row */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#F3EFE8]">
            <span className="text-[10px] uppercase text-[#B8B3C7]">Entry:</span>
            <span>{priceFormatted}</span>
          </div>

          <span className="inline-flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-[#FF7A1A] group-hover:text-[#F5B642] transition-colors">
            <span>{isOpen ? 'Register Now' : 'Explore Event'}</span>
            <span aria-hidden="true">↗</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export const EventCardSkeleton: FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`flex flex-col bg-[#0D1020] rounded-xl border border-white/5 p-3 animate-pulse select-none ${className}`}
    >
      <div className="aspect-[3/2] w-full rounded-lg bg-[#1A1030]/60 mb-3" />
      <div className="space-y-2.5 px-1 flex-1">
        <div className="h-4 w-28 rounded bg-[#1A1030]/80" />
        <div className="h-5 w-4/5 rounded bg-[#1A1030]" />
        <div className="h-4 w-3/5 rounded bg-[#1A1030]/60" />
        <div className="h-4 w-20 rounded bg-[#1A1030]/50 pt-2" />
      </div>
    </div>
  );
};
